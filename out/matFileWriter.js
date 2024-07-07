(() => {
  // node_modules/fflate/esm/browser.js
  var u8 = Uint8Array;
  var u16 = Uint16Array;
  var i32 = Int32Array;
  var fleb = new u8([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    2,
    2,
    2,
    2,
    3,
    3,
    3,
    3,
    4,
    4,
    4,
    4,
    5,
    5,
    5,
    5,
    0,
    /* unused */
    0,
    0,
    /* impossible */
    0
  ]);
  var fdeb = new u8([
    0,
    0,
    0,
    0,
    1,
    1,
    2,
    2,
    3,
    3,
    4,
    4,
    5,
    5,
    6,
    6,
    7,
    7,
    8,
    8,
    9,
    9,
    10,
    10,
    11,
    11,
    12,
    12,
    13,
    13,
    /* unused */
    0,
    0
  ]);
  var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
  var freb = function(eb, start) {
    var b = new u16(31);
    for (var i = 0; i < 31; ++i) {
      b[i] = start += 1 << eb[i - 1];
    }
    var r = new i32(b[30]);
    for (var i = 1; i < 30; ++i) {
      for (var j = b[i]; j < b[i + 1]; ++j) {
        r[j] = j - b[i] << 5 | i;
      }
    }
    return { b, r };
  };
  var _a = freb(fleb, 2);
  var fl = _a.b;
  var revfl = _a.r;
  fl[28] = 258, revfl[258] = 28;
  var _b = freb(fdeb, 0);
  var fd = _b.b;
  var revfd = _b.r;
  var rev = new u16(32768);
  for (i = 0; i < 32768; ++i) {
    x = (i & 43690) >> 1 | (i & 21845) << 1;
    x = (x & 52428) >> 2 | (x & 13107) << 2;
    x = (x & 61680) >> 4 | (x & 3855) << 4;
    rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
  }
  var x;
  var i;
  var hMap = function(cd, mb, r) {
    var s = cd.length;
    var i = 0;
    var l = new u16(mb);
    for (; i < s; ++i) {
      if (cd[i])
        ++l[cd[i] - 1];
    }
    var le = new u16(mb);
    for (i = 1; i < mb; ++i) {
      le[i] = le[i - 1] + l[i - 1] << 1;
    }
    var co;
    if (r) {
      co = new u16(1 << mb);
      var rvb = 15 - mb;
      for (i = 0; i < s; ++i) {
        if (cd[i]) {
          var sv = i << 4 | cd[i];
          var r_1 = mb - cd[i];
          var v = le[cd[i] - 1]++ << r_1;
          for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
            co[rev[v] >> rvb] = sv;
          }
        }
      }
    } else {
      co = new u16(s);
      for (i = 0; i < s; ++i) {
        if (cd[i]) {
          co[i] = rev[le[cd[i] - 1]++] >> 15 - cd[i];
        }
      }
    }
    return co;
  };
  var flt = new u8(288);
  for (i = 0; i < 144; ++i)
    flt[i] = 8;
  var i;
  for (i = 144; i < 256; ++i)
    flt[i] = 9;
  var i;
  for (i = 256; i < 280; ++i)
    flt[i] = 7;
  var i;
  for (i = 280; i < 288; ++i)
    flt[i] = 8;
  var i;
  var fdt = new u8(32);
  for (i = 0; i < 32; ++i)
    fdt[i] = 5;
  var i;
  var flm = /* @__PURE__ */ hMap(flt, 9, 0);
  var fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
  var shft = function(p) {
    return (p + 7) / 8 | 0;
  };
  var slc = function(v, s, e) {
    if (s == null || s < 0)
      s = 0;
    if (e == null || e > v.length)
      e = v.length;
    return new u8(v.subarray(s, e));
  };
  var wbits = function(d, p, v) {
    v <<= p & 7;
    var o = p / 8 | 0;
    d[o] |= v;
    d[o + 1] |= v >> 8;
  };
  var wbits16 = function(d, p, v) {
    v <<= p & 7;
    var o = p / 8 | 0;
    d[o] |= v;
    d[o + 1] |= v >> 8;
    d[o + 2] |= v >> 16;
  };
  var hTree = function(d, mb) {
    var t = [];
    for (var i = 0; i < d.length; ++i) {
      if (d[i])
        t.push({ s: i, f: d[i] });
    }
    var s = t.length;
    var t2 = t.slice();
    if (!s)
      return { t: et, l: 0 };
    if (s == 1) {
      var v = new u8(t[0].s + 1);
      v[t[0].s] = 1;
      return { t: v, l: 1 };
    }
    t.sort(function(a, b) {
      return a.f - b.f;
    });
    t.push({ s: -1, f: 25001 });
    var l = t[0], r = t[1], i0 = 0, i1 = 1, i2 = 2;
    t[0] = { s: -1, f: l.f + r.f, l, r };
    while (i1 != s - 1) {
      l = t[t[i0].f < t[i2].f ? i0++ : i2++];
      r = t[i0 != i1 && t[i0].f < t[i2].f ? i0++ : i2++];
      t[i1++] = { s: -1, f: l.f + r.f, l, r };
    }
    var maxSym = t2[0].s;
    for (var i = 1; i < s; ++i) {
      if (t2[i].s > maxSym)
        maxSym = t2[i].s;
    }
    var tr = new u16(maxSym + 1);
    var mbt = ln(t[i1 - 1], tr, 0);
    if (mbt > mb) {
      var i = 0, dt = 0;
      var lft = mbt - mb, cst = 1 << lft;
      t2.sort(function(a, b) {
        return tr[b.s] - tr[a.s] || a.f - b.f;
      });
      for (; i < s; ++i) {
        var i2_1 = t2[i].s;
        if (tr[i2_1] > mb) {
          dt += cst - (1 << mbt - tr[i2_1]);
          tr[i2_1] = mb;
        } else
          break;
      }
      dt >>= lft;
      while (dt > 0) {
        var i2_2 = t2[i].s;
        if (tr[i2_2] < mb)
          dt -= 1 << mb - tr[i2_2]++ - 1;
        else
          ++i;
      }
      for (; i >= 0 && dt; --i) {
        var i2_3 = t2[i].s;
        if (tr[i2_3] == mb) {
          --tr[i2_3];
          ++dt;
        }
      }
      mbt = mb;
    }
    return { t: new u8(tr), l: mbt };
  };
  var ln = function(n, l, d) {
    return n.s == -1 ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1)) : l[n.s] = d;
  };
  var lc = function(c) {
    var s = c.length;
    while (s && !c[--s])
      ;
    var cl = new u16(++s);
    var cli = 0, cln = c[0], cls = 1;
    var w = function(v) {
      cl[cli++] = v;
    };
    for (var i = 1; i <= s; ++i) {
      if (c[i] == cln && i != s)
        ++cls;
      else {
        if (!cln && cls > 2) {
          for (; cls > 138; cls -= 138)
            w(32754);
          if (cls > 2) {
            w(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
            cls = 0;
          }
        } else if (cls > 3) {
          w(cln), --cls;
          for (; cls > 6; cls -= 6)
            w(8304);
          if (cls > 2)
            w(cls - 3 << 5 | 8208), cls = 0;
        }
        while (cls--)
          w(cln);
        cls = 1;
        cln = c[i];
      }
    }
    return { c: cl.subarray(0, cli), n: s };
  };
  var clen = function(cf, cl) {
    var l = 0;
    for (var i = 0; i < cl.length; ++i)
      l += cf[i] * cl[i];
    return l;
  };
  var wfblk = function(out, pos, dat) {
    var s = dat.length;
    var o = shft(pos + 2);
    out[o] = s & 255;
    out[o + 1] = s >> 8;
    out[o + 2] = out[o] ^ 255;
    out[o + 3] = out[o + 1] ^ 255;
    for (var i = 0; i < s; ++i)
      out[o + i + 4] = dat[i];
    return (o + 4 + s) * 8;
  };
  var wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
    wbits(out, p++, final);
    ++lf[256];
    var _a2 = hTree(lf, 15), dlt = _a2.t, mlb = _a2.l;
    var _b2 = hTree(df, 15), ddt = _b2.t, mdb = _b2.l;
    var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
    var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
    var lcfreq = new u16(19);
    for (var i = 0; i < lclt.length; ++i)
      ++lcfreq[lclt[i] & 31];
    for (var i = 0; i < lcdt.length; ++i)
      ++lcfreq[lcdt[i] & 31];
    var _e = hTree(lcfreq, 7), lct = _e.t, mlcb = _e.l;
    var nlcc = 19;
    for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
      ;
    var flen = bl + 5 << 3;
    var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
    var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
    if (bs >= 0 && flen <= ftlen && flen <= dtlen)
      return wfblk(out, p, dat.subarray(bs, bs + bl));
    var lm, ll, dm, dl;
    wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
    if (dtlen < ftlen) {
      lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
      var llm = hMap(lct, mlcb, 0);
      wbits(out, p, nlc - 257);
      wbits(out, p + 5, ndc - 1);
      wbits(out, p + 10, nlcc - 4);
      p += 14;
      for (var i = 0; i < nlcc; ++i)
        wbits(out, p + 3 * i, lct[clim[i]]);
      p += 3 * nlcc;
      var lcts = [lclt, lcdt];
      for (var it = 0; it < 2; ++it) {
        var clct = lcts[it];
        for (var i = 0; i < clct.length; ++i) {
          var len = clct[i] & 31;
          wbits(out, p, llm[len]), p += lct[len];
          if (len > 15)
            wbits(out, p, clct[i] >> 5 & 127), p += clct[i] >> 12;
        }
      }
    } else {
      lm = flm, ll = flt, dm = fdm, dl = fdt;
    }
    for (var i = 0; i < li; ++i) {
      var sym = syms[i];
      if (sym > 255) {
        var len = sym >> 18 & 31;
        wbits16(out, p, lm[len + 257]), p += ll[len + 257];
        if (len > 7)
          wbits(out, p, sym >> 23 & 31), p += fleb[len];
        var dst = sym & 31;
        wbits16(out, p, dm[dst]), p += dl[dst];
        if (dst > 3)
          wbits16(out, p, sym >> 5 & 8191), p += fdeb[dst];
      } else {
        wbits16(out, p, lm[sym]), p += ll[sym];
      }
    }
    wbits16(out, p, lm[256]);
    return p + ll[256];
  };
  var deo = /* @__PURE__ */ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
  var et = /* @__PURE__ */ new u8(0);
  var dflt = function(dat, lvl, plvl, pre, post, st) {
    var s = st.z || dat.length;
    var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7e3)) + post);
    var w = o.subarray(pre, o.length - post);
    var lst = st.l;
    var pos = (st.r || 0) & 7;
    if (lvl) {
      if (pos)
        w[0] = st.r >> 3;
      var opt = deo[lvl - 1];
      var n = opt >> 13, c = opt & 8191;
      var msk_1 = (1 << plvl) - 1;
      var prev = st.p || new u16(32768), head = st.h || new u16(msk_1 + 1);
      var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
      var hsh = function(i2) {
        return (dat[i2] ^ dat[i2 + 1] << bs1_1 ^ dat[i2 + 2] << bs2_1) & msk_1;
      };
      var syms = new i32(25e3);
      var lf = new u16(288), df = new u16(32);
      var lc_1 = 0, eb = 0, i = st.i || 0, li = 0, wi = st.w || 0, bs = 0;
      for (; i + 2 < s; ++i) {
        var hv = hsh(i);
        var imod = i & 32767, pimod = head[hv];
        prev[imod] = pimod;
        head[hv] = imod;
        if (wi <= i) {
          var rem = s - i;
          if ((lc_1 > 7e3 || li > 24576) && (rem > 423 || !lst)) {
            pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i - bs, pos);
            li = lc_1 = eb = 0, bs = i;
            for (var j = 0; j < 286; ++j)
              lf[j] = 0;
            for (var j = 0; j < 30; ++j)
              df[j] = 0;
          }
          var l = 2, d = 0, ch_1 = c, dif = imod - pimod & 32767;
          if (rem > 2 && hv == hsh(i - dif)) {
            var maxn = Math.min(n, rem) - 1;
            var maxd = Math.min(32767, i);
            var ml = Math.min(258, rem);
            while (dif <= maxd && --ch_1 && imod != pimod) {
              if (dat[i + l] == dat[i + l - dif]) {
                var nl = 0;
                for (; nl < ml && dat[i + nl] == dat[i + nl - dif]; ++nl)
                  ;
                if (nl > l) {
                  l = nl, d = dif;
                  if (nl > maxn)
                    break;
                  var mmd = Math.min(dif, nl - 2);
                  var md = 0;
                  for (var j = 0; j < mmd; ++j) {
                    var ti = i - dif + j & 32767;
                    var pti = prev[ti];
                    var cd = ti - pti & 32767;
                    if (cd > md)
                      md = cd, pimod = ti;
                  }
                }
              }
              imod = pimod, pimod = prev[imod];
              dif += imod - pimod & 32767;
            }
          }
          if (d) {
            syms[li++] = 268435456 | revfl[l] << 18 | revfd[d];
            var lin = revfl[l] & 31, din = revfd[d] & 31;
            eb += fleb[lin] + fdeb[din];
            ++lf[257 + lin];
            ++df[din];
            wi = i + l;
            ++lc_1;
          } else {
            syms[li++] = dat[i];
            ++lf[dat[i]];
          }
        }
      }
      for (i = Math.max(i, wi); i < s; ++i) {
        syms[li++] = dat[i];
        ++lf[dat[i]];
      }
      pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i - bs, pos);
      if (!lst) {
        st.r = pos & 7 | w[pos / 8 | 0] << 3;
        pos -= 7;
        st.h = head, st.p = prev, st.i = i, st.w = wi;
      }
    } else {
      for (var i = st.w || 0; i < s + lst; i += 65535) {
        var e = i + 65535;
        if (e >= s) {
          w[pos / 8 | 0] = lst;
          e = s;
        }
        pos = wfblk(w, pos + 1, dat.subarray(i, e));
      }
      st.i = s;
    }
    return slc(o, 0, pre + shft(pos) + post);
  };
  var adler = function() {
    var a = 1, b = 0;
    return {
      p: function(d) {
        var n = a, m = b;
        var l = d.length | 0;
        for (var i = 0; i != l; ) {
          var e = Math.min(i + 2655, l);
          for (; i < e; ++i)
            m += n += d[i];
          n = (n & 65535) + 15 * (n >> 16), m = (m & 65535) + 15 * (m >> 16);
        }
        a = n, b = m;
      },
      d: function() {
        a %= 65521, b %= 65521;
        return (a & 255) << 24 | (a & 65280) << 8 | (b & 255) << 8 | b >> 8;
      }
    };
  };
  var dopt = function(dat, opt, pre, post, st) {
    if (!st) {
      st = { l: 1 };
      if (opt.dictionary) {
        var dict = opt.dictionary.subarray(-32768);
        var newDat = new u8(dict.length + dat.length);
        newDat.set(dict);
        newDat.set(dat, dict.length);
        dat = newDat;
        st.w = dict.length;
      }
    }
    return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? st.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20 : 12 + opt.mem, pre, post, st);
  };
  var wbytes = function(d, b, v) {
    for (; v; ++b)
      d[b] = v, v >>>= 8;
  };
  var zlh = function(c, o) {
    var lv = o.level, fl2 = lv == 0 ? 0 : lv < 6 ? 1 : lv == 9 ? 3 : 2;
    c[0] = 120, c[1] = fl2 << 6 | (o.dictionary && 32);
    c[1] |= 31 - (c[0] << 8 | c[1]) % 31;
    if (o.dictionary) {
      var h = adler();
      h.p(o.dictionary);
      wbytes(c, 2, h.d());
    }
  };
  function zlibSync(data, opts) {
    if (!opts)
      opts = {};
    var a = adler();
    a.p(data);
    var d = dopt(data, opts, opts.dictionary ? 6 : 2, 4);
    return zlh(d, opts), wbytes(d, d.length - 4, a.d()), d;
  }
  var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
  var tds = 0;
  try {
    td.decode(et, { stream: true });
    tds = 1;
  } catch (e) {
  }

  // src/matFileWriter.ts
  var MatFileWriter = class {
    matFile = [];
    constructor() {
      this.matFile = [];
      this.matFile.push(...this.createMatFileHeader());
    }
    compressionEnabled = true;
    get Compression() {
      return this.compressionEnabled;
    }
    set Compression(v) {
      this.compressionEnabled = v;
    }
    /**
     * Add variable with given name and value to the current matlab file
     * @param name Variable name
     * @param value Variable data
     */
    addVariable(name, value) {
      this.matFile.push(...this.createMatArray(value, name, true));
    }
    sizeOfDataType(dataType) {
      switch (dataType) {
        case 1 /* miINT8 */:
        case 2 /* miUINT8 */:
          return 1;
        case 3 /* miINT16 */:
        case 4 /* miUINT16 */:
          return 2;
        case 7 /* miSINGLE */:
        case 5 /* miINT32 */:
        case 6 /* miUINT32 */:
          return 4;
        case 9 /* miDOUBLE */:
        case 12 /* miINT64 */:
        case 13 /* miUINT64 */:
          return 8;
        default:
          break;
      }
      return 0;
    }
    createMatFileHeader() {
      let headerText = new Uint8Array(116);
      let headerSubsystem = new Uint8Array(8);
      let headerVersion = new Uint16Array(2);
      const datetimeString = (/* @__PURE__ */ new Date()).toISOString();
      let text = `MATLAB 5.0 MAT-file, Created using MatFileWriter on ${datetimeString}`;
      Array.from(text).forEach((v, i) => headerText[i] = v.charCodeAt(0));
      headerVersion[0] = 256;
      headerVersion[1] = 19785;
      return [headerText, headerSubsystem, headerVersion];
    }
    getMatDataTypeFromTypedArray(typedArray) {
      let dataType;
      switch (typedArray.constructor.name) {
        case "Int8Array":
          dataType = 1 /* miINT8 */;
          break;
        case "Uint8Array":
          dataType = 2 /* miUINT8 */;
          break;
        case "Int16Array":
          dataType = 3 /* miINT16 */;
          break;
        case "Uint16Array":
          dataType = 4 /* miUINT16 */;
          break;
        case "Int32Array":
          dataType = 5 /* miINT32 */;
          break;
        case "Uint32Array":
          dataType = 6 /* miUINT32 */;
          break;
        case "BigInt64Array":
          dataType = 12 /* miINT64 */;
          break;
        case "BigUint64Array":
          dataType = 13 /* miUINT64 */;
          break;
        case "Float32Array":
          dataType = 7 /* miSINGLE */;
          break;
        case "Float64Array":
        default:
          dataType = 9 /* miDOUBLE */;
          break;
      }
      return dataType;
    }
    getMatArrayTypeFromTypedArray(typedArray) {
      let dataType;
      switch (typedArray.constructor.name) {
        case "Int8Array":
          dataType = 8 /* mxINT8_CLASS */;
          break;
        case "Uint8Array":
          dataType = 9 /* mxUINT8_CLASS */;
          break;
        case "Int16Array":
          dataType = 10 /* mxINT16_CLASS */;
          break;
        case "Uint16Array":
          dataType = 11 /* mxUINT16_CLASS */;
          break;
        case "Int32Array":
          dataType = 12 /* mxINT32_CLASS */;
          break;
        case "Uint32Array":
          dataType = 13 /* mxUINT32_CLASS */;
          break;
        case "BigInt64Array":
          dataType = 14 /* mxINT64_CLASS */;
          break;
        case "BigUint64Array":
          dataType = 15 /* mxUINT64_CLASS */;
          break;
        case "Float32Array":
          dataType = 7 /* mxSINGLE_CLASS */;
          break;
        case "Float64Array":
        default:
          dataType = 6 /* mxDOUBLE_CLASS */;
          break;
      }
      return dataType;
    }
    /**
     * Put the data in a Data element object
     * Determines datatype based on class of first typedarray by default, can be overruled
     * @param dataType 
     * @param data 
     * @returns 
     */
    createDataElementFromTypedArray(data, dataType = 0 /* UNDEFINED */) {
      if (!Array.isArray(data)) {
        data = [data];
      }
      if (dataType == 0 /* UNDEFINED */) {
        dataType = this.getMatDataTypeFromTypedArray(data[0]);
      }
      let totalDataByteLength = data.reduce((sum, element) => sum + element.byteLength, 0);
      let tag;
      if (totalDataByteLength > 0 && totalDataByteLength <= 4) {
        tag = new Uint16Array(2);
        tag[0] = dataType;
        tag[1] = totalDataByteLength;
      } else {
        tag = new Uint32Array(2);
        tag[0] = dataType;
        tag[1] = totalDataByteLength;
      }
      let totalByteLength = tag.byteLength + totalDataByteLength;
      let next8Byte = Math.ceil(totalByteLength / 8) * 8;
      let padding = new Uint8Array(next8Byte - totalByteLength);
      return [tag, ...data, padding];
    }
    createDataElementFromNumbers(dataType, values) {
      if (!Array.isArray(values)) {
        values = [values];
      }
      let data;
      switch (dataType) {
        case 1 /* miINT8 */:
          data = new Int8Array(values.length);
          break;
        case 2 /* miUINT8 */:
          data = new Uint8Array(values.length);
          break;
        case 3 /* miINT16 */:
          data = new Int16Array(values.length);
          break;
        case 4 /* miUINT16 */:
          data = new Uint16Array(values.length);
          break;
        case 5 /* miINT32 */:
          data = new Int32Array(values.length);
          break;
        case 6 /* miUINT32 */:
          data = new Uint32Array(values.length);
          break;
        case 12 /* miINT64 */:
          data = new BigInt64Array(values.length);
          break;
        case 13 /* miUINT64 */:
          data = new BigUint64Array(values.length);
          break;
        case 7 /* miSINGLE */:
          data = new Float32Array(values.length);
          break;
        case 9 /* miDOUBLE */:
        default:
          data = new Float64Array(values.length);
          break;
      }
      values.forEach((v, i) => data[i] = v);
      return this.createDataElementFromTypedArray(data, dataType);
    }
    stringToUtf8(str) {
      let t = new TextEncoder();
      return t.encode(str);
    }
    // Determine the smallest data type that fits all numbers
    getSmallestDataType(values) {
      let min = 0;
      let max = 0;
      let isInteger = true;
      let isNumber = false;
      values.forEach((v) => {
        if (typeof v == "number") {
          isNumber = true;
          if (v < min)
            min = v;
          if (v > max)
            max = v;
          if (isInteger)
            isInteger = Number.isInteger(v);
        }
      });
      if (isNumber == false) {
        return 9 /* miDOUBLE */;
      }
      let absMin = Math.min(Math.abs(min), max);
      let absMax = Math.max(Math.abs(min), max);
      let dataType = 9 /* miDOUBLE */;
      if (isInteger) {
        if (min == 0 && absMax <= 255)
          dataType = 2 /* miUINT8 */;
        else if (min >= -128 && max <= 127)
          dataType = 1 /* miINT8 */;
        else if (min == 0 && absMax <= 65535)
          dataType = 4 /* miUINT16 */;
        else if (min >= -32768 && max <= 32767)
          dataType = 3 /* miINT16 */;
        else if (min == 0 && absMax <= 4294967295)
          dataType = 6 /* miUINT32 */;
        else if (min >= -2147483648 && max <= 2147483647)
          dataType = 5 /* miINT32 */;
      } else {
        dataType = 9 /* miDOUBLE */;
      }
      return dataType;
    }
    /**
     * Creates a matrix containing numbers.
     * Only accepts 1-D arrays
     * Assumes numbers are to be represented as doubles
     * Might use a smaller range when possible for saving
     */
    createNumericArray(name, realValues, complexValues = []) {
      let matrix = [];
      let tag = new Uint32Array(2);
      tag[0] = 14 /* miMATRIX */;
      matrix.push(tag);
      const _flags = 0;
      let _class = 6 /* mxDOUBLE_CLASS */;
      if (this.isTypedArray(realValues)) {
        _class = this.getMatArrayTypeFromTypedArray(realValues);
      }
      let arrayFlags = this.createDataElementFromNumbers(6 /* miUINT32 */, [(_flags << 8) + _class, 0]);
      matrix.push(...arrayFlags);
      let dimensionArray = this.createDataElementFromNumbers(5 /* miINT32 */, [1, realValues.length]);
      matrix.push(...dimensionArray);
      let arrayName = this.createDataElementFromTypedArray(this.stringToUtf8(name), 1 /* miINT8 */);
      matrix.push(...arrayName);
      let valueType = 9 /* miDOUBLE */;
      if (!ArrayBuffer.isView(realValues)) {
        valueType = this.getSmallestDataType(realValues);
      }
      if (Array.isArray(complexValues) && complexValues.length > 0) {
        valueType = Math.max(valueType, this.getSmallestDataType(complexValues));
      }
      if (ArrayBuffer.isView(realValues)) {
        let realData = this.createDataElementFromTypedArray(realValues);
        matrix.push(...realData);
      } else {
        let realData = this.createDataElementFromNumbers(valueType, realValues);
        matrix.push(...realData);
        if (Array.isArray(complexValues) && complexValues.length > 0) {
          let complexData = this.createDataElementFromNumbers(valueType, realValues);
          matrix.push(...complexData);
        }
      }
      tag[1] = matrix.reduce((sum, element) => sum + element.byteLength, 0) - 8;
      return matrix;
    }
    /**
     * Creates a matrix containing numbers.
     * Only accepts 1-D arrays of string
     * Each string will be saved as a char array with the same length by padding spaces
     */
    createCharArray(name, lines) {
      let matrix = [];
      let tag = new Uint32Array(2);
      tag[0] = 14 /* miMATRIX */;
      matrix.push(tag);
      const _flags = 0;
      const _class = 4 /* mxCHAR_CLASS */;
      let arrayFlags = this.createDataElementFromNumbers(6 /* miUINT32 */, [(_flags << 8) + _class, 0]);
      matrix.push(...arrayFlags);
      let maxLineLength = lines[0].length;
      lines.forEach((l) => {
        if (l.length > maxLineLength)
          maxLineLength = l.length;
      });
      let dimensionArray = this.createDataElementFromNumbers(5 /* miINT32 */, [lines.length, maxLineLength]);
      matrix.push(...dimensionArray);
      let arrayName = this.createDataElementFromTypedArray(this.stringToUtf8(name), 1 /* miINT8 */);
      matrix.push(...arrayName);
      let charData = new Uint8Array(lines.length * maxLineLength);
      let utf8Lines = lines.map((l) => this.stringToUtf8(l));
      let iChar = 0;
      for (let iCol = 0; iCol < maxLineLength; iCol++) {
        for (let iRow = 0; iRow < lines.length; iRow++) {
          charData[iChar] = iCol < utf8Lines[iRow].length ? utf8Lines[iRow][iCol] : 32;
          iChar++;
        }
      }
      let data = this.createDataElementFromTypedArray(charData, 16 /* miUTF8 */);
      matrix.push(...data);
      tag[1] = matrix.reduce((sum, element) => sum + element.byteLength, 0) - 8;
      return matrix;
    }
    /**
     * Same as createCharArray, but saves string as UTF16. Not used
     * Creates a matrix containing numbers.
     * Only accepts 1-D arrays of string
     * Each string will be saved as a char array with the same length by padding spaces
     */
    createCharArrayUtf16(name, lines) {
      let matrix = [];
      let tag = new Uint32Array(2);
      tag[0] = 14 /* miMATRIX */;
      matrix.push(tag);
      const _flags = 0;
      const _class = 4 /* mxCHAR_CLASS */;
      let arrayFlags = this.createDataElementFromNumbers(6 /* miUINT32 */, [(_flags << 8) + _class, 0]);
      matrix.push(...arrayFlags);
      let maxLineLength = lines[0].length;
      lines.forEach((l) => {
        if (l.length > maxLineLength)
          maxLineLength = l.length;
      });
      let dimensionArray = this.createDataElementFromNumbers(5 /* miINT32 */, [lines.length, maxLineLength]);
      matrix.push(...dimensionArray);
      let arrayName = this.createDataElementFromTypedArray(this.stringToUtf8(name), 1 /* miINT8 */);
      matrix.push(...arrayName);
      let charData = new Uint16Array(lines.length * maxLineLength);
      let iChar = 0;
      for (let iCol = 0; iCol < maxLineLength; iCol++) {
        for (let iRow = 0; iRow < lines.length; iRow++) {
          charData[iChar] = iCol < lines[iRow].length ? lines[iRow].charCodeAt(iCol) : 32;
          iChar++;
        }
      }
      let data = this.createDataElementFromTypedArray(charData, 17 /* miUTF16 */);
      matrix.push(...data);
      tag[1] = matrix.reduce((sum, element) => sum + element.byteLength, 0) - 8;
      return matrix;
    }
    /**
     * Creates a matrix containing cells.
     * Only accepts 1-D arrays
     * Converts strings to numeric arrays containg chars
     * Converts objects to structs
     * Converts numbers to numeric array
     */
    createCellArray(name, values) {
      let matrix = [];
      let tag = new Uint32Array(2);
      tag[0] = 14 /* miMATRIX */;
      matrix.push(tag);
      const _flags = 0;
      const _class = 1 /* mxCELL_CLASS */;
      let arrayFlags = this.createDataElementFromNumbers(6 /* miUINT32 */, [(_flags << 8) + _class, 0]);
      matrix.push(...arrayFlags);
      let dimensionArray = this.createDataElementFromNumbers(5 /* miINT32 */, [1, values.length]);
      matrix.push(...dimensionArray);
      let arrayName = this.createDataElementFromTypedArray(this.stringToUtf8(name), 1 /* miINT8 */);
      matrix.push(...arrayName);
      values.forEach((v) => {
        if (Array.isArray(v))
          matrix.push(...this.createMatArray(v));
        else
          matrix.push(...this.createMatArray([v]));
      });
      tag[1] = matrix.reduce((sum, element) => sum + element.byteLength, 0) - 8;
      return matrix;
    }
    /**
     * Test if all provided objects have the same keys
     * @param objects 
     */
    allObjectsHaveTheSameKeys(objects) {
      const keys1 = Object.keys(objects[0]).sort();
      for (let iObject = 1; iObject < objects.length; iObject++) {
        const keys2 = Object.keys(objects[iObject]).sort();
        if (keys1.length != keys2.length) {
          return false;
        }
        for (let iKey = 0; iKey < keys1.length; iKey++) {
          if (keys1[iKey] != keys2[iKey]) {
            return false;
          }
        }
      }
      return true;
    }
    allElementsHaveTheSameType(array) {
      function myType(o) {
        let t2 = typeof o;
        if (t2 == "object")
          t2 = o.constructor.name;
        return t2;
      }
      let t = myType(array[0]);
      for (let i = 1; i < array.length; i++) {
        if (t != myType(array[i])) {
          return false;
        }
      }
      return true;
    }
    isTypedArray(arg) {
      const supportedTypes = [
        "Int8Array",
        "Uint8Array",
        "Int16Array",
        "Uint16Array",
        "Int32Array",
        "Uint32Array",
        "BigInt64Array",
        "BigUint64Array",
        "Float32Array",
        "Float64Array"
      ];
      return supportedTypes.includes(arg.constructor.name);
    }
    /**
     * Create a matrix most suited to host the given values 
     * @param values 
     * @returns 
     */
    createMatArray(data, name = "", toplevel = false) {
      let values;
      if (Array.isArray(data) || this.isTypedArray(data)) {
        values = data;
      } else {
        values = [data];
      }
      let matrix = [];
      if (this.isTypedArray(values)) {
        matrix = this.createNumericArray(name, values);
      } else if (values.length == 1 && this.isTypedArray(values[0])) {
        matrix = this.createNumericArray(name, values[0]);
      } else {
        let allElementsHaveTheSameType = this.allElementsHaveTheSameType(values);
        if (allElementsHaveTheSameType && typeof values[0] == "number") {
          matrix = this.createNumericArray(name, values);
        } else if (allElementsHaveTheSameType && typeof values[0] == "string") {
          if (values.length == 1) {
            matrix = this.createCharArray(name, values);
          } else {
            matrix = this.createCellArray(name, values);
          }
        } else if (allElementsHaveTheSameType && values[0].constructor.name == "Object" && this.allObjectsHaveTheSameKeys(values)) {
          matrix = this.createStructArray(name, values);
        } else {
          matrix = this.createCellArray(name, values);
        }
      }
      if (toplevel && this.compressionEnabled)
        return this.createZippedArray(matrix);
      else
        return matrix;
    }
    /**
     * Create a matlab struct array
     * Only supports 1-D objects
     * @param data An array of objects of the same type
     */
    createStructArray(name, data) {
      let struct = [];
      let tag = new Uint32Array(2);
      tag[0] = 14 /* miMATRIX */;
      struct.push(tag);
      const _flags = 0;
      const _class = 2 /* mxSTRUCT_CLASS */;
      let arrayFlags = this.createDataElementFromNumbers(6 /* miUINT32 */, [(_flags << 8) + _class, 0]);
      struct.push(...arrayFlags);
      let dimensionArray = this.createDataElementFromNumbers(5 /* miINT32 */, [1, data.length]);
      struct.push(...dimensionArray);
      let arrayName = this.createDataElementFromTypedArray(this.stringToUtf8(name), 1 /* miINT8 */);
      struct.push(...arrayName);
      let keys = Object.keys(data[0]);
      let maxFieldNameLength = Math.max(...keys.map((key) => key.length)) + 1;
      let fieldNameLength = this.createDataElementFromNumbers(5 /* miINT32 */, [maxFieldNameLength]);
      struct.push(...fieldNameLength);
      let fieldNamesArray = keys.map((key) => this.stringToUtf8(key.padEnd(maxFieldNameLength, "\0")));
      let fieldNames = this.createDataElementFromTypedArray(fieldNamesArray, 1 /* miINT8 */);
      struct.push(...fieldNames);
      data.forEach((o) => {
        keys.forEach((key) => {
          const v = o[key];
          if (Array.isArray(v))
            struct.push(...this.createMatArray(v));
          else
            struct.push(...this.createMatArray([v]));
        });
      });
      tag[1] = struct.reduce((sum, element) => sum + element.byteLength, 0) - 8;
      return struct;
    }
    createZippedArray(variable) {
      let combined = new Uint8Array(variable.reduce((sum, element) => sum + element.byteLength, 0));
      let c = 0;
      for (let v of variable) {
        combined.set(new Uint8Array(v.buffer), c);
        c += v.byteLength;
      }
      const zipped = zlibSync(combined, { level: 6 });
      let tag = new Uint32Array(2);
      tag[0] = 15 /* miCOMPRESSED */;
      tag[1] = zipped.byteLength;
      return [tag, zipped];
    }
    getBlob() {
      let blob = new Blob(this.matFile);
      return blob;
    }
  };
})();
//# sourceMappingURL=matFileWriter.js.map
