var roms = {
	"sk": { data: null, sizeLimit: 0x200000, warnCheck: checkSkWarn, error: "" },
	"locked": { data: null, sizeLimit: 0x400000, warnCheck: checkLockedWarn, error: "" },
	"kis2": { data: null, sizeLimit: 0x100000, warnCheck: checkKiS2Warn, error: "" }
}

var s2Rom = false;
var forceKiS2 = false;

var sonic2Serials = new Set();
sonic2Serials.add("GM 00001051-00");
sonic2Serials.add("GM 00001051-01");
sonic2Serials.add("GM 00001051-02");

for (const id in roms) {
	document.getElementById(`${id}-rom`).value = null;
	document.getElementById(`${id}-rom`).addEventListener("change", (event) => {
		uploadRom(id, roms[id].sizeLimit);
	}, false);
}

document.getElementById("force-kis2").addEventListener("change", (event) => {
	forceKiS2 = event.currentTarget.checked;
	updateAllStatuses();
});

document.getElementById("combine-button").disabled = true;

function uploadRom(id, sizeLimit)
{
	const file = document.getElementById(`${id}-rom`).files[0];

	if (file.size <= sizeLimit) {
		const reader = new FileReader();
		reader.readAsArrayBuffer(file);

		reader.onload = function() {
			roms[id].data = padRom(reader.result);
			roms[id].error = "";
			updateAllStatuses();
		};

		reader.onerror = function() {
			roms[id].data = null;
			roms[id].error = "ERROR: Failed to load file.";
			console.error(`Failed to load "${file.name}" (${reader.error})`);
			updateAllStatuses();
		};
	} else {
		roms[id].data = null;
		roms[id].error = "ERROR: File is too large.";
		updateAllStatuses();
	}
}

function updateAllStatuses()
{
	for (const id in roms) {
		updateStatus(id, roms[id].warnCheck);
	}

	const button = document.getElementById("combine-button");
	button.disabled = true;
	
	if (roms["locked"].data != null && roms["sk"].data != null) {
		if (!s2Rom || (s2Rom && roms["kis2"].data != null)) {
			button.disabled = false;
		}
	}
}

function updateStatus(id, warnChecker)
{
	const data = roms[id].data;
	const status = document.getElementById(`${id}-status`);
	let msg = "";
	let error = false;

	if (data != null) {
		msg = warnChecker(data);
	} else if (roms[id].error.length > 0) {
		msg = roms[id].error;
		error = true;
	}

	status.innerText = msg;
	status.className = error ? "error-text" : "warn-text";
}

function checkLockedWarn(data)
{
	s2Rom = false;

	let header = 0x100;
	if (data.length > 0x200000) {
		header = 0x200100;
	}
	const sega = new TextDecoder().decode(data.slice(header, header + 4));
	const serial = new TextDecoder().decode(data.slice(header + 0x80, header + 0x8E));

	let msg = "";
	if (sega != "SEGA") {
		msg = `WARNING: Could not find Sega Genesis ROM header at offset 0x${header.toString(16)} in the file.`;
	} else if (sonic2Serials.has(serial)) {
		s2Rom = true;
		if (roms["kis2"].data == null && !forceKiS2) {
			msg = `WARNING: Sonic 2 serial number detected. The Knuckles in Sonic 2 UPMEM file must be set.`;
		}
	}
	return msg;
}

function checkSkWarn(data)
{
	const sega = new TextDecoder().decode(data.slice(0x100, 0x104));

	let msg = "";
	if (md5(data) != "4ea493ea4e9f6c9ebfccbdb15110367e") {
		msg = "WARNING: File does not appear to be the stock Sonic & Knuckles ROM.";
	}
	return msg;
}

function checkKiS2Warn(data)
{
	let msg = "";
	if (md5(data) != "b4e76e416b887f4e7413ba76fa735f16") {
		msg = "WARNING: File does not appear to be the stock Knuckles in Sonic 2 UPMEM.";
	}
	return msg;
}

function padRom(data)
{
	const padSize = 1 << Math.ceil(Math.log2(data.byteLength));
	const newData = new Uint8Array(padSize);
	newData.set(new Uint8Array(data));
	newData.fill(0xFF, data.byteLength, padSize);
	return newData;
}

function applyRomData(srcData, destData, offset, endOffset)
{
	while (offset < endOffset) {
		destData.set(srcData, offset);
		offset += srcData.length;
	}
}

function combineRoms()
{
	let data = new Uint8Array(0x400000);

	applyRomData(roms["locked"].data, data, 0, 0x400000);
	applyRomData(roms["sk"].data, data, 0, 0x200000);
	if (forceKiS2 || s2Rom) {
		applyRomData(roms["kis2"].data, data, 0x300000, 0x400000);
	}

	let inheritSRAM = document.getElementById("inherit-sram");
	if (inheritSRAM.checked) {
		let sram = roms["locked"].data.slice(0x1B0, 0x1BC);
		data.set(sram, 0x1B0);
	}

	let download = document.getElementById("download");
	let blob = new Blob([data], {type: "application/octet-stream"});
	download.href = window.URL.createObjectURL(blob);
	download.click();
	window.URL.revokeObjectURL(download.href);
}
