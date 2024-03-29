// Based on http://www.myersdaily.org/joseph/javascript/md5.js
// By Joseph Myers
function md5(data)
{
	if (data == null) {
		return "";
	}

	let state = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476];
	return calc(data);

	function calc(data)
	{
		for (i = 64; i <= data.length; i += 64) {
			cycle(block(data.slice(i - 64, i)));
		}
		let bytes = data.slice(i - 64);

		let tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		for (i = 0; i < bytes.length; i++) {
			tail[i >> 2] |= bytes[i] << ((i & 3) << 3);
		}
		tail[i >> 2] |= 0x80 << ((i & 3) << 3);

		if (i >= 56) {
			cycle(tail);
			tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		}

		tail[14] = data.length * 8;
		cycle(tail);

		return toHex(state[0]) + toHex(state[1]) + toHex(state[2]) + toHex(state[3]);
	}

	function toHex(a)
	{
		let hex = "0123456789abcdef";
		let s = "";
		for (let i = 0; i < 32; i += 8) {
			s += hex[(a >>> (i + 4)) & 0xF] + hex[(a >>> i) & 0xF];
		}
		return s;
	}

	function add(a, b)
	{
		return (a + b) & 0xFFFFFFFF;
	}

	function block(bytes)
	{
		let block = [];
		for (let i = 0; i < 64; i += 4) {
			block[i >> 2] = (bytes[i]) +
							(bytes[i + 1] << 8) +
							(bytes[i + 2] << 16) +
							(bytes[i + 3] << 24);
		}
		return block;
	}

	function cycle(k)
	{
		let a = state[0];
		let b = state[1];
		let c = state[2];
		let d = state[3];

		a = ff(a, b, c, d, k[0], 7, 0xD76AA478);
		d = ff(d, a, b, c, k[1], 12, 0xE8C7B756);
		c = ff(c, d, a, b, k[2], 17, 0x242070DB);
		b = ff(b, c, d, a, k[3], 22, 0xC1BDCEEE);
		a = ff(a, b, c, d, k[4], 7, 0xF57C0FAF);
		d = ff(d, a, b, c, k[5], 12, 0x4787C62A);
		c = ff(c, d, a, b, k[6], 17, 0xA8304613);
		b = ff(b, c, d, a, k[7], 22, 0xFD469501);
		a = ff(a, b, c, d, k[8], 7, 0x698098D8);
		d = ff(d, a, b, c, k[9], 12, 0x8B44F7AF);
		c = ff(c, d, a, b, k[10], 17, 0xFFFF5BB1);
		b = ff(b, c, d, a, k[11], 22, 0x895CD7BE);
		a = ff(a, b, c, d, k[12], 7, 0x6B901122);
		d = ff(d, a, b, c, k[13], 12, 0xFD987193);
		c = ff(c, d, a, b, k[14], 17, 0xA679438E);
		b = ff(b, c, d, a, k[15], 22, 0x49B40821);

		a = gg(a, b, c, d, k[1], 5, 0xF61E2562);
		d = gg(d, a, b, c, k[6], 9, 0xC040B340);
		c = gg(c, d, a, b, k[11], 14, 0x265E5A51);
		b = gg(b, c, d, a, k[0], 20, 0xE9B6C7AA);
		a = gg(a, b, c, d, k[5], 5, 0xD62F105D);
		d = gg(d, a, b, c, k[10], 9, 0x02441453);
		c = gg(c, d, a, b, k[15], 14, 0xD8A1E681);
		b = gg(b, c, d, a, k[4], 20, 0xE7D3FBC8);
		a = gg(a, b, c, d, k[9], 5, 0x21E1CDE6);
		d = gg(d, a, b, c, k[14], 9, 0xC33707D6);
		c = gg(c, d, a, b, k[3], 14, 0xF4D50D87);
		b = gg(b, c, d, a, k[8], 20, 0x455A14ED);
		a = gg(a, b, c, d, k[13], 5, 0xA9E3E905);
		d = gg(d, a, b, c, k[2], 9, 0xFCEFA3F8);
		c = gg(c, d, a, b, k[7], 14, 0x676F02D9);
		b = gg(b, c, d, a, k[12], 20, 0x8D2A4C8A);

		a = hh(a, b, c, d, k[5], 4, 0xFFFA3942);
		d = hh(d, a, b, c, k[8], 11, 0x8771F681);
		c = hh(c, d, a, b, k[11], 16, 0x6D9D6122);
		b = hh(b, c, d, a, k[14], 23, 0xFDE5380C);
		a = hh(a, b, c, d, k[1], 4, 0xA4BEEA44);
		d = hh(d, a, b, c, k[4], 11, 0x4BDECFA9);
		c = hh(c, d, a, b, k[7], 16, 0xF6BB4B60);
		b = hh(b, c, d, a, k[10], 23, 0xBEBFBC70);
		a = hh(a, b, c, d, k[13], 4, 0x289B7EC6);
		d = hh(d, a, b, c, k[0], 11, 0xEAA127FA);
		c = hh(c, d, a, b, k[3], 16, 0xD4EF3085);
		b = hh(b, c, d, a, k[6], 23, 0x04881D05);
		a = hh(a, b, c, d, k[9], 4, 0xD9D4D039);
		d = hh(d, a, b, c, k[12], 11, 0xE6DB99E5);
		c = hh(c, d, a, b, k[15], 16, 0x1FA27CF8);
		b = hh(b, c, d, a, k[2], 23, 0xC4AC5665);

		a = ii(a, b, c, d, k[0], 6, 0xF4292244);
		d = ii(d, a, b, c, k[7], 10, 0x432AFF97);
		c = ii(c, d, a, b, k[14], 15, 0xAB9423A7);
		b = ii(b, c, d, a, k[5], 21, 0xFC93A039);
		a = ii(a, b, c, d, k[12], 6, 0x655B59C3);
		d = ii(d, a, b, c, k[3], 10, 0x8F0CCC92);
		c = ii(c, d, a, b, k[10], 15, 0xFFEFF47D);
		b = ii(b, c, d, a, k[1], 21, 0x85845DD1);
		a = ii(a, b, c, d, k[8], 6, 0x6FA87E4F);
		d = ii(d, a, b, c, k[15], 10, 0xFE2CE6E0);
		c = ii(c, d, a, b, k[6], 15, 0xA3014314);
		b = ii(b, c, d, a, k[13], 21, 0x4E0811A1);
		a = ii(a, b, c, d, k[4], 6, 0xF7537E82);
		d = ii(d, a, b, c, k[11], 10, 0xBD3AF235);
		c = ii(c, d, a, b, k[2], 15, 0x2AD7D2BB);
		b = ii(b, c, d, a, k[9], 21, 0xEB86D391);

		state[0] = add(a, state[0]);
		state[1] = add(b, state[1]);
		state[2] = add(c, state[2]);
		state[3] = add(d, state[3]);
	}

	function ff(a, b, c, d, x, s, t)
	{
		return cycleCalc((b & c) | ((~b) & d), a, b, x, s, t);
	}

	function gg(a, b, c, d, x, s, t)
	{
		return cycleCalc((b & d) | (c & (~d)), a, b, x, s, t);
	}

	function hh(a, b, c, d, x, s, t)
	{
		return cycleCalc(b ^ c ^ d, a, b, x, s, t);
	}

	function ii(a, b, c, d, x, s, t)
	{
		return cycleCalc(c ^ (b | (~d)), a, b, x, s, t);
	}

	function cycleCalc(q, a, b, x, s, t)
	{
		a = add(add(a, q), add(x, t));
		return add((a << s) | (a >>> (32 - s)), b);
	}
}