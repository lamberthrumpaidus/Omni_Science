const DB = {
    "Kalkulator Dasar": {
        "Operasi Standar": {
            inputs: [{ id: "expr", label: "Masukkan Angka & Operator (cth: 10 + 5 * 2 / 4 - 1)", t: "text" }],
            calc: (v) => math.evaluate(v.expr)
        }
    },
    "Kalkulus & Matriks": {
        "Turunan Pertama f'(x)": {
            inputs: [{ id: "f", label: "Fungsi f(x)", t: "text" }, { id: "v", label: "Variabel", t: "text", d: "x" }],
            calc: (v) => math.derivative(v.f, v.v).toString()
        },
        "Integral Tentu (Simpson's 1/3)": {
            inputs: [{ id: "f", label: "Fungsi f(x)", t: "text" }, { id: "a", label: "Batas Bawah", t: "number" }, { id: "b", label: "Batas Atas", t: "number" }],
            calc: (v) => {
                const f = math.compile(v.f);
                const n = 1000;
                const h = (v.b - v.a) / n;
                let s = f.evaluate({ x: v.a }) + f.evaluate({ x: v.b });
                for (let i = 1; i < n; i += 2) s += 4 * f.evaluate({ x: v.a + i * h });
                for (let i = 2; i < n - 1; i += 2) s += 2 * f.evaluate({ x: v.a + i * h });
                return parseFloat(((h / 3) * s).toPrecision(8));
            }
        },
        "Limit Aproksimasi": {
            inputs: [{ id: "f", label: "Fungsi f(x)", t: "text" }, { id: "c", label: "Mendekati (c)", t: "number" }],
            calc: (v) => {
                const f = math.compile(v.f);
                const h = 1e-10;
                const left = f.evaluate({ x: v.c - h });
                const right = f.evaluate({ x: v.c + h });
                return parseFloat(((left + right) / 2).toPrecision(8));
            }
        },
        "Determinan Matriks 3x3": {
            inputs: [{ id: "m", label: "Format: [[a,b,c],[d,e,f],[g,h,i]]", t: "text" }],
            calc: (v) => parseFloat(math.det(JSON.parse(v.m)).toPrecision(8))
        }
    },
    "Fisika Kuantum & Klasik": {
        "Relativitas (E=mc²)": {
            inputs: [{ id: "m", label: "Massa (kg)", t: "number" }],
            calc: (v) => `${v.m * Math.pow(299792458, 2)} Joule`
        },
        "Dilatasi Waktu": {
            inputs: [{ id: "t0", label: "Waktu Diam (s)", t: "number" }, { id: "v", label: "Kecepatan (m/s)", t: "number" }],
            calc: (v) => {
                const c = 299792458;
                const ratio = Math.pow(v.v / c, 2);
                return ratio >= 1 ? "Error: Melebihi Kecepatan Cahaya" : `${parseFloat((v.t0 / Math.sqrt(1 - ratio)).toPrecision(8))} sekon`;
            }
        },
        "Hukum Gravitasi Newton": {
            inputs: [{ id: "m1", label: "Massa 1 (kg)", t: "number" }, { id: "m2", label: "Massa 2 (kg)", t: "number" }, { id: "r", label: "Jarak (m)", t: "number" }],
            calc: (v) => `${parseFloat(((6.67430e-11 * v.m1 * v.m2) / Math.pow(v.r, 2)).toPrecision(8))} Newton`
        },
        "Persamaan Bernoulli (P1)": {
            inputs: [{ id: "p2", label: "P2 (Pa)", t: "number" }, { id: "rho", label: "Massa Jenis (kg/m³)", t: "number" }, { id: "v1", label: "v1 (m/s)", t: "number" }, { id: "v2", label: "v2 (m/s)", t: "number" }, { id: "h1", label: "h1 (m)", t: "number" }, { id: "h2", label: "h2 (m)", t: "number" }],
            calc: (v) => `${parseFloat((v.p2 + 0.5 * v.rho * (Math.pow(v.v2, 2) - Math.pow(v.v1, 2)) + v.rho * 9.80665 * (v.h2 - v.h1)).toPrecision(8))} Pascal`
        }
    },
    "Kimia & Termodinamika": {
        "Energi Bebas Gibbs": {
            inputs: [{ id: "h", label: "Entalpi (ΔH) [J]", t: "number" }, { id: "t", label: "Suhu (K)", t: "number" }, { id: "s", label: "Entropi (ΔS) [J/K]", t: "number" }],
            calc: (v) => {
                const g = v.h - (v.t * v.s);
                return `${parseFloat(g.toPrecision(8))} Joule (${g < 0 ? 'Spontan' : g > 0 ? 'Tidak Spontan' : 'Setimbang'})`;
            }
        },
        "Persamaan Nernst": {
            inputs: [{ id: "e0", label: "E° Sel (V)", t: "number" }, { id: "n", label: "Mol Elektron", t: "number" }, { id: "q", label: "Q (Quotient Reaksi)", t: "number" }],
            calc: (v) => `${parseFloat((v.e0 - (0.0592 / v.n) * Math.log10(v.q)).toPrecision(8))} Volt`
        },
        "pH Buffer Asam": {
            inputs: [{ id: "pka", label: "pKa", t: "number" }, { id: "garam", label: "Molaritas Garam (M)", t: "number" }, { id: "asam", label: "Molaritas Asam (M)", t: "number" }],
            calc: (v) => `${parseFloat((v.pka + Math.log10(v.garam / v.asam)).toPrecision(8))}`
        }
    },
    "Biologi & Biofisika": {
        "Laju Transpirasi Ekologi": {
            inputs: [{ id: "v", label: "Volume Air Hilang (mL)", t: "number" }, { id: "t", label: "Waktu (Jam)", t: "number" }, { id: "a", label: "Luas Permukaan (m²)", t: "number" }],
            calc: (v) => `${parseFloat((v.v / (v.t * v.a)).toPrecision(8))} mL/jam/m²`
        },
        "Cardiac Output (Curah Jantung)": {
            inputs: [{ id: "hr", label: "Heart Rate (BPM)", t: "number" }, { id: "sv", label: "Stroke Volume (mL)", t: "number" }],
            calc: (v) => `${parseFloat(((v.hr * v.sv) / 1000).toPrecision(8))} Liter/menit`
        },
        "Energi ATP Glikolisis": {
            inputs: [{ id: "glukosa", label: "Mol Glukosa", t: "number" }],
            calc: (v) => `${v.glukosa * 2} mol ATP`
        }
    },
    "Konversi Universal": {
        "Massa & Waktu": {
            inputs: [{ id: "val", label: "Nilai", t: "number" }, { id: "f", label: "Dari", t: "sel", o: "kg,g,mg,lb,oz,ton,jam,menit,detik" }, { id: "to", label: "Ke", t: "sel", o: "kg,g,mg,lb,oz,ton,jam,menit,detik" }],
            calc: (v) => {
                const f = { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495, ton: 1000, jam: 3600, menit: 60, detik: 1 };
                if (!f[v.f] || !f[v.to]) return "Satuan tidak valid lintas dimensi";
                let res = (v.val * f[v.f]) / f[v.to];
                return `${parseFloat(res.toPrecision(8))} ${v.to}`;
            }
        },
        "Sistem Bilangan & Kriptografi": {
            inputs: [{ id: "val", label: "String/Angka", t: "text" }, { id: "type", label: "Operasi", t: "sel", o: "Bin2Dec,Dec2Bin,Base64Encode,Base64Decode" }],
            calc: (v) => {
                if (v.type === "Bin2Dec") return parseInt(v.val, 2).toString();
                if (v.type === "Dec2Bin") return parseInt(v.val, 10).toString(2);
                if (v.type === "Base64Encode") return btoa(v.val);
                if (v.type === "Base64Decode") return atob(v.val);
            }
        }
    }
};