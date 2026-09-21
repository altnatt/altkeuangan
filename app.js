// ======================================================
// ALTUS – BRI
// FULL APP.JS
// MULTI PROFILE + BUDGET + ELECTRICITY SYSTEM
// ======================================================


// ======================================================
// DATA DEFAULT SEMUA PROFIL
// ======================================================

const DEFAULT_PROFILES = {

    // ==================================================
    // ALTUS BRI
    // ==================================================

    "ALTUS-BRI": {

        name: "ALTUS",
        bank: "BRI",
        initial: "A",

        expenses: {

            "Sewa Rumah": {
                budget: 1200000,
                spent: 0,
                type: "monthly",
                paidDate: null
            },

            "Listrik": {
                budget: 400000,
                spent: 0,
                type: "repeating",
                paidDate: null,
                history: []
            },

            "Air": {
                budget: 300000,
                spent: 0,
                type: "monthly",
                paidDate: null
            },

            "Gas": {
                budget: 30000,
                spent: 0,
                type: "monthly",
                paidDate: null
            },

            "Wifi": {
                budget: 250000,
                spent: 0,
                type: "monthly",
                paidDate: null
            },

            "Nyuci": {
                budget: 280000,
                spent: 0,
                type: "variable",
                paidDate: null
            },

            "Galon": {
                budget: 185000,
                spent: 0,
                type: "repeating",
                paidDate: null
            },

            "Bensin": {
                budget: 300000,
                spent: 0,
                type: "variable",
                paidDate: null
            }

        }

    },


    // ==================================================
    // BELLA BRI
    // ==================================================

    "BELLA-BRI": {

        name: "BELLA",
        bank: "BRI",
        initial: "B",

        expenses: {

            "Belanja Pasar": {
                budget: 1000000,
                spent: 0,
                type: "variable",
                paidDate: null
            },

            "Beras": {
                budget: 300000,
                spent: 0,
                type: "variable",
                paidDate: null
            },

            "Minyak Manis": {
                budget: 160000,
                spent: 0,
                type: "variable",
                paidDate: null
            }

        }

    },


    // ==================================================
    // BELLA BSI
    // ==================================================

    "BELLA-BSI": {

        name: "BELLA",
        bank: "BSI",
        initial: "B",

        expenses: {

            "Jajan/Main/Lainnya": {
                budget: 2000000,
                spent: 0,
                type: "variable",
                paidDate: null
            },

            "Gojek Sekolah": {
                budget: 104000,
                spent: 0,
                type: "variable",
                paidDate: null
            },

            "Susu & Pempers": {
                budget: 600000,
                spent: 0,
                type: "variable",
                paidDate: null
            },

            "Paylater (Jika Ada)": {
                budget: 700000,
                spent: 0,
                type: "variable",
                paidDate: null
            }

        }

    }

};


// ======================================================
// DATA AKTIF
// ======================================================

let profiles =
    JSON.parse(
        JSON.stringify(DEFAULT_PROFILES)
    );


let currentProfileKey =
    "ALTUS-BRI";

    // ======================================================
// BULAN AKTIF
// ======================================================

let currentMonthKey =
    "2026-09";

// ======================================================
// PROFIL AKTIF
// ======================================================

function getCurrentProfile() {

    return profiles[currentProfileKey];

}


// ======================================================
// MESIN DATA BULAN
// ======================================================

function isValidMonthKey(monthKey) {

    return /^\d{4}-(0[1-9]|1[0-2])$/.test(
        monthKey
    );

}


// ======================================================
// MEMBUAT DATA BULAN BARU
// Budget tetap.
// Pengeluaran, pembayaran, dan history di-reset.
// ======================================================

function cloneExpensesForNewMonth(
    sourceExpenses
) {

    const result = {};

    Object.keys(
        sourceExpenses || {}
    ).forEach(name => {

        const item =
            sourceExpenses[name] || {};

        result[name] = {

            ...item,

            // Anggaran tetap mengikuti bulan sebelumnya
            budget:
                Number(item.budget || 0),

            // Pengeluaran bulan baru = 0
            spent: 0,

            // Status pembayaran di-reset
            paidDate: null

        };


        // History transaksi juga di-reset
        if (
            Array.isArray(item.history)
        ) {

            result[name].history = [];

        }

    });

    return result;

}


// ======================================================
// MENCARI SUMBER ANGGARAN UNTUK BULAN BARU
// Prioritas:
// 1. Bulan sebelumnya yang paling dekat
// 2. Bulan terdekat yang tersedia
// 3. Data expenses lama
// 4. Default profile
// ======================================================

function getSourceExpensesForMonth(
    profile,
    monthKey
) {

    if (!profile) {
        return {};
    }


    if (!profile.months) {
        profile.months = {};
    }


    const monthKeys =
        Object.keys(
            profile.months
        )
        .filter(isValidMonthKey)
        .sort();


    // Cari bulan sebelum bulan yang dipilih
    const previousMonths =
        monthKeys.filter(
            key => key < monthKey
        );


    if (previousMonths.length > 0) {

        const previousMonthKey =
            previousMonths[
                previousMonths.length - 1
            ];

        const previousMonth =
            profile.months[
                previousMonthKey
            ];

        if (
            previousMonth &&
            previousMonth.expenses
        ) {

            return previousMonth.expenses;

        }

    }


    // Kalau tidak ada bulan sebelumnya,
    // gunakan bulan yang sudah tersedia
    if (monthKeys.length > 0) {

        const nearestMonthKey =
            monthKeys[0];

        const nearestMonth =
            profile.months[
                nearestMonthKey
            ];

        if (
            nearestMonth &&
            nearestMonth.expenses
        ) {

            return nearestMonth.expenses;

        }

    }


    // Fallback ke struktur lama
    if (profile.expenses) {

        return profile.expenses;

    }


    // Fallback terakhir ke default profile
    const defaultProfile =
        DEFAULT_PROFILES[
            profile.key
        ];

    if (
        defaultProfile &&
        defaultProfile.expenses
    ) {

        return defaultProfile.expenses;

    }


    return {};

}


// ======================================================
// MEMASTIKAN BULAN TERSEDIA
// Kalau belum ada → buat.
// Kalau sudah ada → JANGAN diubah.
// ======================================================

function ensureMonthForProfile(
    profile,
    monthKey
) {

    if (!profile) {
        return {};
    }


    if (
        !isValidMonthKey(monthKey)
    ) {

        monthKey = "2026-09";

    }


    if (!profile.months) {

        profile.months = {};

    }


    // Kalau bulan sudah ada,
    // gunakan data yang sudah tersimpan.
    if (
        profile.months[monthKey]
    ) {

        if (
            !profile.months[monthKey].expenses
        ) {

            profile.months[monthKey].expenses =
                {};

        }

        return profile
            .months[monthKey]
            .expenses;

    }


    // Ambil sumber anggaran
    const sourceExpenses =
        getSourceExpensesForMonth(
            profile,
            monthKey
        );


    // Buat bulan baru
    profile.months[monthKey] = {

        expenses:
            cloneExpensesForNewMonth(
                sourceExpenses
            )

    };


    return profile
        .months[monthKey]
        .expenses;

}


// ======================================================
// MENGAMBIL EXPENSES BULAN AKTIF
// ======================================================

function getCurrentExpenses() {

    const profile =
        getCurrentProfile();

    if (!profile) {
        return {};
    }


    return ensureMonthForProfile(
        profile,
        currentMonthKey
    );

}

// ======================================================
// MEMBUAT DATA BULAN DARI DATA LAMA
// ======================================================

function createMonthFromExistingExpenses(
    sourceExpenses,
    preserveData = false
) {

    const result = {};

    Object.keys(
        sourceExpenses || {}
    ).forEach(name => {

        const item =
            sourceExpenses[name] || {};

        result[name] = {

            ...item,

            budget:
                Number(item.budget || 0),

            spent:
                preserveData
                    ? Number(item.spent || 0)
                    : 0,

            paidDate:
                preserveData
                    ? (item.paidDate || null)
                    : null

        };

        // Listrik punya history transaksi
        if (
            Array.isArray(item.history)
        ) {

            result[name].history =
                preserveData
                    ? item.history.map(
                        transaction => ({
                            ...transaction
                        })
                    )
                    : [];

        }

    });

    return result;

}


// ======================================================
// FORMAT RUPIAH
// ======================================================

function rupiah(number) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }
    ).format(number);

}


// ======================================================
// TANGGAL HARI INI
// ======================================================

function getToday() {

    const now = new Date();

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const year =
        now.getFullYear();

    return `${day}-${month}-${year}`;

}


// ======================================================
// TOTAL ANGGARAN
// ======================================================

function getBudgetTotal() {

    let total = 0;

    Object.values(
        getCurrentExpenses()
    ).forEach(item => {

        total +=
            Number(item.budget || 0);

    });

    return total;

}


// ======================================================
// TOTAL TERPAKAI
// ======================================================

function getTotalSpent() {

    let total = 0;

    Object.values(
        getCurrentExpenses()
    ).forEach(item => {

        total +=
            Number(item.spent || 0);

    });

    return total;

}


// ======================================================
// SIMPAN SEMUA PROFIL
// ======================================================

function saveProfiles() {

    localStorage.setItem(
        "altus_bri_profiles",
        JSON.stringify(profiles)
    );


    localStorage.setItem(
        "altus_current_profile",
        currentProfileKey
    );


    localStorage.setItem(
        "altus_bri_current_month",
        currentMonthKey
    );

}


// ======================================================
// LOAD DATA
// ======================================================

function loadProfiles() {

    const saved =
        localStorage.getItem(
            "altus_bri_profiles"
        );


    // ==================================================
    // LOAD DATA MULTI PROFILE
    // ==================================================

    if (saved) {

        try {

            const parsed =
                JSON.parse(saved);

            Object.keys(
                DEFAULT_PROFILES
            ).forEach(key => {

                if (parsed[key]) {

                    profiles[key] =
                        parsed[key];

                }

            });

        } catch (error) {

            console.error(
                "Gagal membaca profil:",
                error
            );

        }

    }


    // ==================================================
    // MIGRASI DATA ALTUS LAMA
    // ==================================================

    const oldData =
        localStorage.getItem(
            "altus_bri_expenses"
        );


    if (
        oldData &&
        !saved
    ) {

        try {

            const oldExpenses =
                JSON.parse(oldData);

            Object.keys(oldExpenses)
                .forEach(name => {

                    if (
                        profiles["ALTUS-BRI"]
                            .expenses[name]
                    ) {

                        if (
                            typeof oldExpenses[name]
                                .budget ===
                            "number"
                        ) {

                            profiles[
                                "ALTUS-BRI"
                            ]
                            .expenses[name]
                            .budget =
                                oldExpenses[name]
                                    .budget;

                        }


                        if (
                            typeof oldExpenses[name]
                                .spent ===
                            "number"
                        ) {

                            profiles[
                                "ALTUS-BRI"
                            ]
                            .expenses[name]
                            .spent =
                                oldExpenses[name]
                                    .spent;

                        }


                        if (
                            oldExpenses[name]
                                .paidDate
                        ) {

                            profiles[
                                "ALTUS-BRI"
                            ]
                            .expenses[name]
                            .paidDate =
                                oldExpenses[name]
                                    .paidDate;

                        }

                    }

                });

        } catch (error) {

            console.error(
                "Gagal migrasi data lama:",
                error
            );

        }

    }


    // ==================================================
    // BULAN AKTIF
    // ==================================================

    const savedMonth =
        localStorage.getItem(
            "altus_bri_current_month"
        );


    if (
        savedMonth &&
        /^\d{4}-\d{2}$/.test(savedMonth)
    ) {

        currentMonthKey =
            savedMonth;

    } else {

        currentMonthKey =
            "2026-09";

    }


    // ==================================================
    // MIGRASI STRUKTUR KE SISTEM BULANAN
    // ==================================================

    Object.keys(profiles)
        .forEach(key => {

            const profile =
                profiles[key];

            // ------------------------------------------
            // Kalau belum punya struktur months
            // ------------------------------------------

            if (!profile.months) {

                profile.months = {};

            }


            // ------------------------------------------
            // Buat September 2026
            // dari data lama yang sudah ada
            // ------------------------------------------

            if (
                !profile.months["2026-09"]
            ) {

                const oldExpenses =
                    profile.expenses ||
                    DEFAULT_PROFILES[key]
                        .expenses ||
                    {};

                profile.months["2026-09"] = {

                    expenses:
                        createMonthFromExistingExpenses(
                            oldExpenses,
                            true
                        )

                };

            }


            // ------------------------------------------
            // Pastikan bulan aktif tersedia
            // ------------------------------------------

            if (
                !profile.months[
                    currentMonthKey
                ]
            ) {

                let sourceExpenses = null;

                const monthKeys =
                    Object.keys(
                        profile.months
                    ).sort();

                if (
                    monthKeys.length > 0
                ) {

                    const latestMonth =
                        monthKeys[
                            monthKeys.length - 1
                        ];

                    sourceExpenses =
                        profile
                            .months[
                                latestMonth
                            ]
                            .expenses;

                }

                if (!sourceExpenses) {

                    sourceExpenses =
                        profile.expenses ||
                        DEFAULT_PROFILES[key]
                            .expenses ||
                        {};

                }

                profile.months[
                    currentMonthKey
                ] = {

                    expenses:
                        createMonthFromExistingExpenses(
                            sourceExpenses,
                            false
                        )

                };

            }


            // ------------------------------------------
            // Pastikan history Listrik tersedia
            // ------------------------------------------

            const expenses =
                profile
                    .months[
                        currentMonthKey
                    ]
                    .expenses;

            if (
                expenses["Listrik"] &&
                !Array.isArray(
                    expenses["Listrik"]
                        .history
                )
            ) {

                expenses["Listrik"]
                    .history = [];

            }

        });


    // ==================================================
    // PROFIL TERAKHIR
    // ==================================================

    const savedCurrent =
        localStorage.getItem(
            "altus_current_profile"
        );


    if (
        savedCurrent &&
        profiles[savedCurrent]
    ) {

        currentProfileKey =
            savedCurrent;

    }


    // ==================================================
    // SIMPAN HASIL MIGRASI
    // ==================================================

    saveProfiles();

}


// ======================================================
// UPDATE HEADER PROFIL
// ======================================================

// ======================================================
// GANTI BULAN AKTIF
// ======================================================

function switchMonth(
    monthKey
) {

    if (
        !isValidMonthKey(monthKey)
    ) {

        alert(
            "Bulan yang dipilih tidak valid."
        );

        return;

    }


    currentMonthKey =
        monthKey;

    closeMonthSelector();

    // Pastikan bulan tersedia
    const profile =
        getCurrentProfile();

    if (profile) {

        ensureMonthForProfile(
            profile,
            currentMonthKey
        );

    }


    // Simpan bulan aktif
    saveProfiles();


    // Refresh tampilan
    updateProfileHeader();

    renderExpenseCards();

    updateDashboard();

    setupEvents();

    addBudgetButton();

}

// ======================================================
// FORMAT NAMA BULAN
// Contoh: 2026-09 → September 2026
// ======================================================

function formatMonthLabel(
    monthKey
) {

    if (
        !isValidMonthKey(monthKey)
    ) {

        return monthKey;

    }


    const [
        year,
        month
    ] =
        monthKey.split("-");


    const monthNames = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember"
    ];


    return `${
        monthNames[
            Number(month) - 1
        ]
    } ${year}`;

}

// ======================================================
// UPDATE HEADER PROFIL + BULAN
// ======================================================

function updateProfileHeader() {

    const profile =
        getCurrentProfile();

    const accountName =
        document.querySelector(
            ".account-name"
        );

    const bankName =
        document.querySelector(
            ".bank-name"
        );

    const avatar =
        document.querySelector(
            ".avatar"
        );


    // ==============================================
    // PROFIL
    // ==============================================

    if (accountName) {

        accountName.innerHTML = `
            <span class="account-name-text">
                ${profile.name}
            </span>
        `;

    }


    // ==============================================
    // BANK
    // ==============================================

    if (bankName) {

        bankName.textContent =
            profile.bank;

    }


    // ==============================================
    // AVATAR
    // ==============================================

    if (avatar) {

        avatar.textContent =
            profile.initial;

    }


    // ==============================================
    // JUDUL
    // ==============================================

    document.title =
        `${profile.name} – ${profile.bank}`;


    // ==============================================
    // UPDATE BULAN
    // ==============================================

    updateMonthSelector();

}

// ======================================================
// STYLE SELECTOR BULAN
// ======================================================

function addMonthSelectorStyles() {

    if (
        document.getElementById(
            "month-selector-styles"
        )
    ) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "month-selector-styles";

    style.textContent = `

       .month-selector {

            height: 64px;

            min-width: 235px;

            padding: 0 17px;

            display: flex;
            align-items: center;

            gap: 11px;

            border: 1px solid
                rgba(20,70,110,.08);

            border-radius: 18px;

            background: rgba(255,255,255,.96);

            color: #0c2b55;

            font-size: 16px;

            font-weight: 700;

            cursor: pointer;

            box-shadow:
                0 8px 25px
                rgba(35,80,120,.09);

            transition:
                transform .18s ease,
                box-shadow .18s ease;

        }

        .month-selector span {
            pointer-events: none;
        }


        .calendar {

            width: 22px;
            height: 22px;

            flex: 0 0 22px;

            border:
                2px solid #005658;

            border-radius: 6px;

            position: relative;

        }


        .calendar:before {

            content: "";

            position: absolute;

            left: 3px;
            right: 3px;

            top: 6px;

            height: 2px;

            background: #005658;

            border-radius: 2px;

        }


        .calendar:after {

            content: "";

            position: absolute;

            left: 5px;

            top: -4px;

            width: 3px;

            height: 7px;

            border-radius: 3px;

            background: #005658;

            box-shadow:
                9px 0 0 #005658;

        }


        .month-arrow {

            margin-left: auto;

            width: 26px;
            height: 26px;

            display: flex;

            align-items: center;

            justify-content: center;

            border-radius: 50%;

            background: #f0f7f7;

            color: #005658;

            font-size: 0;

        }


        .month-arrow:after {

            content: "";

            width: 7px;
            height: 7px;

            border-right:
                2px solid #005658;

            border-bottom:
                2px solid #005658;

            transform:
                rotate(45deg)
                translateY(-2px);

        }


        .month-selector-overlay {
            position: fixed;
            inset: 0;

            z-index: 99999;

            display: flex;
            align-items: flex-end;
            justify-content: center;

            background:
                rgba(0, 0, 0, .35);
        }


        .month-selector-sheet {
            width: 100%;
            max-width: 440px;
            max-height: 75vh;

            overflow-y: auto;

            box-sizing: border-box;

            padding: 12px 16px 24px;

            background: #fff;

            border-radius:
                22px 22px 0 0;

            box-shadow:
                0 -8px 30px
                rgba(0,0,0,.15);
        }


        .month-selector-sheet
        .sheet-handle {

            width: 42px;
            height: 5px;

            margin:
                2px auto 16px;

            border-radius: 10px;

            background: #d7e1e3;
        }


        .month-selector-title {

            text-align: center;

            font-size: 18px;
            font-weight: 800;

            color: #005658;

            margin-bottom: 12px;
        }


        .month-option {

            width: 100%;

            display: flex;
            align-items: center;
            justify-content: space-between;

            box-sizing: border-box;

            padding: 14px 15px;
            margin-bottom: 8px;

            border: 1px solid #e5eeee;
            border-radius: 12px;

            background: #fff;
            color: #333;

            font-size: 15px;
            font-weight: 600;

            cursor: pointer;
        }


        .month-option.active {

            background: #005658;
            color: #fff;

            border-color: #005658;
        }


        .month-check {

            font-size: 17px;
            font-weight: 800;
        }

    `;

    document.head.appendChild(style);
}

// ======================================================
// SELECTOR BULAN
// ======================================================

// ======================================================
// UPDATE SELECTOR BULAN
// ======================================================

// ======================================================
// UPDATE SELECTOR BULAN
// ======================================================

function updateMonthSelector() {

    const selector =
        document.querySelector(".month-selector");

    if (!selector) {
        return;
    }

    const label =
        selector.querySelector(
            "span:not(.month-arrow)"
        );

    if (label) {
        label.textContent =
            formatMonthLabel(
                currentMonthKey
            );
    }

    selector.onclick = function(event) {

        event.preventDefault();
        event.stopPropagation();

        openMonthSelector();

    };

}

// ======================================================
// BUKA PILIHAN BULAN
// ======================================================

function openMonthSelector() {

    const existing =
        document.querySelector(
            ".month-selector-overlay"
        );


    if (existing) {

        existing.remove();

    }


    const months = [];


    // Buat daftar 12 bulan:
    // 6 bulan sebelumnya + bulan aktif
    // + 6 bulan berikutnya

    const [
        currentYear,
        currentMonth
    ] =
        currentMonthKey
            .split("-")
            .map(Number);


    for (
        let offset = -6;
        offset <= 6;
        offset++
    ) {

        const date =
            new Date(
                currentYear,
                currentMonth - 1 + offset,
                1
            );


        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");


        months.push(
            `${year}-${month}`
        );

    }


    const html = `

        <div
            class="month-selector-overlay"
            onclick="closeMonthSelector(event)"
        >

            <div
                class="month-selector-sheet"
                onclick="event.stopPropagation()"
            >

                <div class="sheet-handle"></div>

                <div class="month-selector-title">
                    Pilih Bulan
                </div>


                <div class="month-options">

                    ${months.map(
                        month => `

                            <button
                                class="
                                    month-option
                                    ${
                                        month ===
                                        currentMonthKey
                                            ? "active"
                                            : ""
                                    }
                                "
                                onclick="
                                    switchMonth(
                                        '${month}'
                                    )
                                "
                            >

                                <span>
                                    ${formatMonthLabel(
                                        month
                                    )}
                                </span>

                                ${
                                    month ===
                                    currentMonthKey
                                        ? `
                                            <span
                                                class="
                                                    month-check
                                                "
                                            >
                                                ✓
                                            </span>
                                        `
                                        : ""
                                }

                            </button>

                        `
                    ).join("")}

                </div>

            </div>

        </div>

    `;


    document.body.insertAdjacentHTML(
        "beforeend",
        html
    );

}

// ======================================================
// TUTUP PILIHAN BULAN
// ======================================================

function closeMonthSelector(event) {

    if (
        event &&
        event.target &&
        !event.target.classList.contains(
            "month-selector-overlay"
        )
    ) {

        return;

    }


    const overlay =
        document.querySelector(
            ".month-selector-overlay"
        );


    if (overlay) {

        overlay.remove();

    }

}

// ======================================================
// BUAT KARTU PENGELUARAN
// ======================================================

function createExpenseCard(
    name,
    item
) {

    const icon =
        getExpenseIcon(name);

    return `

        <div
            class="card"
            data-expense="${escapeHtml(name)}"
        >

            <div class="card-top">

                <div
                    class="icon ${icon.className}"
                >

                    ${icon.svg}

                </div>


                <div class="card-info">

                    <div class="card-name">

                        ${escapeHtml(name)}

                    </div>


                    <div class="card-amount">

                        ${rupiah(item.budget)}

                    </div>

                </div>


                <div class="chevron">

                    ›

                </div>

            </div>


            <div class="card-progress">

                <span></span>

            </div>


            <div class="card-remaining">

            ${
                name === "Air"

                    ? (
                        item.paidDate

                            ? (
                                item.spent < item.budget

                                    ? "✓ Sisa " +
                                    rupiah(
                                        item.budget -
                                        item.spent
                                    )

                                    : item.spent === item.budget

                                        ? "✓ Sesuai batas wajar"

                                        : "✓ Sudah dibayar • Lebih " +
                                        rupiah(
                                            item.spent -
                                            item.budget
                                        )
                            )

                            : "Belum dibayar • Batas wajar " +
                            rupiah(item.budget)
                    )

                    : "Sisa " +
                    rupiah(
                        Math.max(
                            item.budget -
                            item.spent,
                            0
                        )
                    )
            }

        </div>

        </div>

    `;

}


// ======================================================
// RENDER KARTU
// ======================================================

function renderExpenseCards() {

    const container =
        document.querySelector(
            ".expenses"
        );


    if (!container) {

        return;

    }


    const expenses =
        getCurrentExpenses();


    let html = "";


    Object.keys(expenses)
        .forEach(name => {

            html +=
                createExpenseCard(
                    name,
                    expenses[name]
                );

        });


    container.innerHTML =
        html;


    setupEvents();

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

// ======================================================
// ICON PENGELUARAN
// ======================================================

// ======================================================
// ICON PENGELUARAN - SVG MODERN
// ======================================================

function getExpenseIcon(name) {

    const icons = {

        "Sewa Rumah": {
            className: "icon-house",
            svg: `
                <svg viewBox="0 0 24 24"
                    aria-hidden="true">
                    <path
                        d="M3 10.5L12 3l9 7.5"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                    <path
                        d="M5 9.5V21h14V9.5"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linejoin="round"
                    />
                    <path
                        d="M9 21v-6h6v6"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linejoin="round"
                    />
                </svg>
            `
        },


        "Listrik": {
            className: "icon-electric",
            svg: `
                <svg viewBox="0 0 24 24"
                    aria-hidden="true">
                    <path
                        d="M13 2L5 13h6l-1 9 8-12h-6l1-8z"
                        fill="currentColor"
                    />
                </svg>
            `
        },


        "Air": {
            className: "icon-water",
            svg: `
                <svg viewBox="0 0 24 24"
                    aria-hidden="true">
                    <path
                        d="M12 2
                           C12 2 5 10 5 15
                           a7 7 0 0 0 14 0
                           C19 10 12 2 12 2z"
                        fill="currentColor"
                    />
                </svg>
            `
        },


        "Gas": {
            className: "icon-gas",
            svg: `
                <svg viewBox="0 0 24 24"
                    aria-hidden="true">
                    <path
                        d="M13.5 2
                           C14.5 6 11 7.5 11 11
                           c0 1.4.8 2.5 2 3.2
                           .2-2 1.5-3.4 2.5-4.5
                           C17.5 12 19 14 19 17
                           a7 7 0 1 1-14 0
                           c0-3.5 2.2-5.5 5-8
                           .3 2 .9 3 2 3.7
                           -.2-3.5.8-6.7 1.5-10.7z"
                        fill="currentColor"
                    />
                </svg>
            `
        },


        "Wifi": {
            className: "icon-wifi",
            svg: `
                <svg viewBox="0 0 24 24"
                    aria-hidden="true">
                    <path
                        d="M3 9
                           a14 14 0 0 1 18 0"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                    />
                    <path
                        d="M6 13
                           a9.5 9.5 0 0 1 12 0"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                    />
                    <path
                        d="M9.5 17
                           a5 5 0 0 1 5 0"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                    />
                    <circle
                        cx="12"
                        cy="20"
                        r="1.3"
                        fill="currentColor"
                    />
                </svg>
            `
        },


        "Nyuci": {
            className: "icon-wash",
            svg: `
                <svg viewBox="0 0 24 24"
                    aria-hidden="true">
                    <path
                        d="M5 4h14l1 16H4L5 4z"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linejoin="round"
                    />
                    <circle
                        cx="12"
                        cy="13"
                        r="4"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    />
                    <circle
                        cx="8"
                        cy="7.5"
                        r="1"
                        fill="currentColor"
                    />
                    <circle
                        cx="11"
                        cy="7.5"
                        r="1"
                        fill="currentColor"
                    />
                </svg>
            `
        },


        "Galon": {
            className: "icon-gallon",
            svg: `
                <svg viewBox="0 0 24 24"
                    aria-hidden="true">
                    <path
                        d="M8 5h8v3
                           l2 2v10
                           H6V10l2-2V5z"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linejoin="round"
                    />
                    <path
                        d="M9 5V3h6v2"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                    />
                    <path
                        d="M8 15h8"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                    />
                </svg>
            `
        },


        "Bensin": {
            className: "icon-fuel",
            svg: `
                <svg viewBox="0 0 24 24"
                    aria-hidden="true">
                    <path
                        d="M5 21V5
                           a2 2 0 0 1 2-2h6
                           a2 2 0 0 1 2 2v16"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linejoin="round"
                    />
                    <path
                        d="M5 9h10"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    />
                    <path
                        d="M15 7h2l3 3v7
                           a2 2 0 0 1-4 0v-3"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                    <path
                        d="M8 6h4"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                    />
                </svg>
            `
        },


        "Belanja Pasar": {
            className: "icon-shopping",
            svg: `
                <svg viewBox="0 0 24 24"
                    aria-hidden="true">
                    <path
                        d="M4 8h16l-1 12H5L4 8z"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linejoin="round"
                    />
                    <path
                        d="M8 8a4 4 0 0 1 8 0"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    />
                </svg>
            `
        },


        "Beras": {
            className: "icon-rice",
            svg: `
                <svg viewBox="0 0 24 24"
                    aria-hidden="true">
                    <path
                        d="M7 8h10l1 13H6L7 8z"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linejoin="round"
                    />
                    <path
                        d="M9 8
                           C9 5 15 5 15 8"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    />
                    <path
                        d="M9 13h6"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                    />
                </svg>
            `
        },


        "Minyak Manis": {
            className: "icon-oil",
            svg: `
                <svg viewBox="0 0 24 24"
                    aria-hidden="true">
                    <path
                        d="M8 7h8l1 14H7L8 7z"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linejoin="round"
                    />
                    <path
                        d="M10 7V4h4v3"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    />
                    <path
                        d="M12 12
                           c-2 2-2 4 0 5
                           2-1 2-3 0-5z"
                        fill="currentColor"
                    />
                </svg>
            `
        },


        "Jajan/Main/Lainnya": {
            className: "icon-other",
            svg: `
                <svg viewBox="0 0 24 24"
                    aria-hidden="true">
                    <circle
                        cx="12"
                        cy="12"
                        r="8"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    />
                    <path
                        d="M12 7v10M8.5 9.5
                           c0-1.2 1.2-2 3.5-2
                           2.1 0 3.5.8 3.5 2
                           0 1.3-1.2 1.8-3.5 2
                           -2.3.2-3.5.8-3.5 2
                           0 1.2 1.4 2 3.5 2
                           2.3 0 3.5-.8 3.5-2"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                    />
                </svg>
            `
        },


        "Gojek Sekolah": {
            className: "icon-school",
            svg: `
                <svg viewBox="0 0 24 24"
                    aria-hidden="true">
                    <path
                        d="M5 17l1-7h9l3 3v4"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linejoin="round"
                    />
                    <circle
                        cx="8"
                        cy="18"
                        r="2"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    />
                    <circle
                        cx="16"
                        cy="18"
                        r="2"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    />
                    <path
                        d="M15 10V7h3l2 3"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linejoin="round"
                    />
                </svg>
            `
        },


        "Susu & Pempers": {
            className: "icon-baby",
            svg: `
                <svg viewBox="0 0 24 24"
                    aria-hidden="true">
                    <path
                        d="M9 5h6l1 4
                           c2 1 3 3 3 5
                           v5H5v-5
                           c0-2 1-4 3-5l1-4z"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linejoin="round"
                    />
                    <path
                        d="M9 5h6"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    />
                    <circle
                        cx="10"
                        cy="13"
                        r="1"
                        fill="currentColor"
                    />
                    <circle
                        cx="14"
                        cy="13"
                        r="1"
                        fill="currentColor"
                    />
                </svg>
            `
        },


        "Paylater (Jika Ada)": {
            className: "icon-paylater",
            svg: `
                <svg viewBox="0 0 24 24"
                    aria-hidden="true">
                    <rect
                        x="3"
                        y="6"
                        width="18"
                        height="13"
                        rx="2"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    />
                    <path
                        d="M3 10h18"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    />
                    <path
                        d="M7 15h4"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                    />
                </svg>
            `
        }

    };


    return (
        icons[name] || {

            className: "icon-default",

            svg: `
                <svg viewBox="0 0 24 24">
                    <circle
                        cx="12"
                        cy="12"
                        r="5"
                        fill="currentColor"
                    />
                </svg>
            `

        }
    );

}


// ======================================================
// UPDATE DASHBOARD
// ======================================================

// ======================================================
// UPDATE DASHBOARD - FINAL
// ======================================================

function updateDashboard() {

    const expenses =
        getCurrentExpenses();


    // ==============================================
    // TOTAL ANGGARAN
    // ==============================================

    let budgetTotal = 0;

    let totalSpent = 0;


    Object.values(expenses)
        .forEach(item => {

            budgetTotal +=
                Number(item.budget || 0);

            totalSpent +=
                Number(item.spent || 0);

        });


    // ==============================================
    // SISA
    // ==============================================

    const remaining =
        budgetTotal -
        totalSpent;


    // ==============================================
    // PERSENTASE TERPAKAI
    // ==============================================

    let usedPercent =
        budgetTotal > 0
            ? (
                totalSpent /
                budgetTotal
            ) * 100
            : 0;


    usedPercent =
        Math.max(
            0,
            Math.min(
                usedPercent,
                100
            )
        );


    // ==============================================
    // PERSENTASE SISA
    // ==============================================

    const remainingPercent =
        Math.max(
            0,
            100 - usedPercent
        );


    // =================================================
    // TOTAL ANGGARAN
    // =================================================

    const budgetElement =
        document.querySelector(
            ".budget-total"
        );


    if (budgetElement) {

        budgetElement.textContent =
            rupiah(budgetTotal);

    }


    // =================================================
    // SUMMARY
    // =================================================

    const summaryItems =
        document.querySelectorAll(
            ".summary .summary-item"
        );


    // =================================================
    // TERPAKAI
    // =================================================

    if (summaryItems[0]) {

        const value =
            summaryItems[0].querySelector(
                ".summary-value"
            );


        const percent =
            summaryItems[0].querySelector(
                ".summary-percent"
            );


        if (value) {

            value.textContent =
                rupiah(totalSpent);

        }


        if (percent) {

            percent.textContent =
                `(${Math.round(
                    usedPercent
                )}%)`;

        }

    }


    // =================================================
    // SISA
    // =================================================

    if (summaryItems[1]) {

        const value =
            summaryItems[1].querySelector(
                ".summary-value"
            );


        const percent =
            summaryItems[1].querySelector(
                ".summary-percent"
            );


        if (value) {

            value.textContent =
                remaining >= 0

                    ? rupiah(remaining)

                    : "-" +
                      rupiah(
                          Math.abs(
                              remaining
                          )
                      );

        }


        if (percent) {

            percent.textContent =
                `(${Math.round(
                    remainingPercent
                )}%)`;

        }

    }


    // =================================================
    // STATUS
    // =================================================

    // =================================================
// STATUS ANGGARAN
// =================================================

if (summaryItems[2]) {

    const status =
        summaryItems[2].querySelector(
            ".safe"
        );


    if (status) {

        // =========================================
        // AMAN
        // 0 - 74%
        // =========================================

        if (usedPercent < 75) {

            status.textContent =
                "✓ Aman";

            status.style.background =
                "#47c89d";

            status.style.color =
                "#ffffff";

        }

        // =========================================
        // WASPADA
        // 75 - 99%
        // =========================================

        else if (usedPercent < 100) {

            status.textContent =
                "⚠ Waspada";

            status.style.background =
                "#f4b740";

            status.style.color =
                "#ffffff";

        }

        // =========================================
        // MELEBIHI
        // 100% ATAU LEBIH
        // =========================================

        else {

            status.textContent =
                "✕ Melebihi";

            status.style.background =
                "#ef6b6b";

            status.style.color =
                "#ffffff";

        }

    }

}


    // =================================================
    // PROGRESS UTAMA
    // =================================================

    const mainProgress =
        document.querySelector(
            ".budget-progress-fill"
        );


    if (mainProgress) {

        mainProgress.style.width =
            usedPercent + "%";

        mainProgress.style.transition =
            "width .45s ease";

    }


    // =================================================
    // UPDATE SEMUA KARTU
    // =================================================

    updateExpenseCards();

}


// ======================================================
// UPDATE SEMUA KARTU
// ======================================================

function updateExpenseCards() {

    const cards =
        document.querySelectorAll(
            ".expenses .card"
        );


    cards.forEach(card => {

        const name =
            card.dataset.expense;

        const item =
            getCurrentExpenses()[name];


        if (!item) {

            return;

        }


        const remaining =
            Math.max(
                item.budget -
                item.spent,
                0
            );


        const percentage =
            item.budget > 0
                ? (
                    item.spent /
                    item.budget
                ) * 100
                : 0;

        const visualPercentage =
            Math.min(
                percentage,
                100
            );


        const amount =
            card.querySelector(
                ".card-amount"
            );


        if (amount) {

            amount.textContent =
                rupiah(item.budget);

        }


        const remainingElement =
            card.querySelector(
                ".card-remaining"
            );


        if (
            name === "Listrik" ||
            name === "Nyuci" ||
            name === "Galon" ||
            name === "Bensin" ||
            name === "Belanja Pasar" ||
            name === "Beras" ||
            name === "Minyak Manis" ||
            name === "Jajan/Main/Lainnya" ||
            name === "Susu & Pempers" ||
            name === "Gojek Sekolah" ||
            name === "Paylater (Jika Ada)"
        ) {

            if (item.spent > item.budget) {

                const excess =
                    item.spent - item.budget;

                remainingElement.textContent =
                    "⚠ Melebihi target " +
                    rupiah(excess);

                remainingElement.classList.add(
                    "electricity-over-budget"
                );

            }
            else if (item.spent === item.budget) {

                remainingElement.textContent =
                    "✓ Target tercapai";

                remainingElement.classList.remove(
                    "electricity-over-budget"
                );

            }
            else {

                remainingElement.textContent =
                    "Sisa " +
                    rupiah(
                        Math.max(
                            item.budget -
                            item.spent,
                            0
                        )
                    );

                remainingElement.classList.remove(
                    "electricity-over-budget"
                );

            }

        }
        else if (
                    name === "Air" ||
                    name === "Gas"
                ) {

            remainingElement.classList.remove(
                "electricity-over-budget"
            );

            // BELUM DIBAYAR
            if (!item.paidDate) {

                remainingElement.textContent =
                    "Sisa " +
                    rupiah(item.budget);

            }

            // SUDAH BAYAR, DI BAWAH BATAS
            else if (item.spent < item.budget) {

                remainingElement.textContent =
                    "✓ Sisa " +
                    rupiah(
                        item.budget -
                        item.spent
                    );

            }

            // PAS BATAS WAJAR
            else if (item.spent === item.budget) {

                remainingElement.textContent =
                    "✓ Sesuai batas wajar";

            }

            // MELEBIHI BATAS WAJAR
            else {

                remainingElement.textContent =
                    "✓ Melebihi batas wajar " +
                    rupiah(
                        item.spent -
                        item.budget
                    );

            }

        }
        else {

            remainingElement.textContent =
                "Sisa " +
                rupiah(
                    Math.max(
                        item.budget -
                        item.spent,
                        0
                    )
                );

            remainingElement.classList.remove(
                "electricity-over-budget"
            );

        }


        const progress =
            card.querySelector(
                ".card-progress span"
            );


        if (progress) {

    progress.style.width =
        `${visualPercentage}%`;


    // ==========================================
    // WARNA PROGRESS
    // ==========================================

    // LISTRIK • NYUCI • GALON • BENSIN
// BELANJA PASAR • BERAS • MINYAK MANIS
    if (
        name === "Listrik" ||
        name === "Nyuci" ||
        name === "Galon" ||
        name === "Bensin" ||
        name === "Belanja Pasar" ||
        name === "Beras" ||
        name === "Minyak Manis" ||
        name === "Jajan/Main/Lainnya" ||
        name === "Susu & Pempers" ||
        name === "Gojek Sekolah" ||
        name === "Paylater (Jika Ada)"
    ) {

        if (
            percentage > 100
        ) {

            progress.style.setProperty(
                "background",
                "#e55353",
                "important"
            );

        } else {

            progress.style.setProperty(
                "background",
                "#005658",
                "important"
            );

        }

    }


    // AIR
    else if (
        name === "Air"
    ) {

        if (
            item.paidDate &&
            item.spent > item.budget
        ) {

            progress.style.setProperty(
                "background",
                "#e55353",
                "important"
            );

        }

        else if (
            item.paidDate &&
            item.spent <= item.budget
        ) {

            progress.style.setProperty(
                "background",
                "#28a745",
                "important"
            );

        }

        else {

            progress.style.setProperty(
                "background",
                "#005658",
                "important"
            );

        }

    }


    // GAS
    else if (
        name === "Gas"
    ) {

        if (
            item.paidDate &&
            item.spent > item.budget
        ) {

            progress.style.setProperty(
                "background",
                "#e55353",
                "important"
            );

        }

        else if (
            item.paidDate &&
            item.spent <= item.budget
        ) {

            progress.style.setProperty(
                "background",
                "#28a745",
                "important"
            );

        }

        else {

            progress.style.setProperty(
                "background",
                "#005658",
                "important"
            );

        }

    }


    // SEWA RUMAH
    else if (
        name === "Sewa Rumah" &&
        item.paidDate
    ) {

        progress.style.setProperty(
            "background",
            "#28a745",
            "important"
        );

    }


    // DEFAULT
    else {

        progress.style.setProperty(
            "background",
            "#005658",
            "important"
        );

    }

}

        // ==========================================
        // WARNA PROGRESS
        // ==========================================

        if (
            item.spent >= item.budget &&
            name !== "Sewa Rumah" &&
            name !== "Air" &&
            name !== "Gas" &&
            name !== "Belanja Pasar" &&
            name !== "Beras" &&
            name !== "Minyak Manis" &&
            name !== "Jajan/Main/Lainnya" &&
            name !== "Susu & Pempers" &&
            name !== "Gojek Sekolah" &&
            name !== "Paylater (Jika Ada)"
        ) {
            card.classList.add("fully-used");
        } else {
            card.classList.remove("fully-used");
        }

        // ==========================================
// WARNA PROGRESS AIR - FINAL
// ==========================================

if (name === "Air") {

    const airProgress =
        card.querySelector(
            ".card-progress span"
        );

    if (airProgress) {

        if (item.spent > item.budget) {

            // AIR MELEBIHI BATAS → MERAH
            airProgress.style.setProperty(
                "background",
                "#e55353",
                "important"
            );

        }

        else if (item.paidDate) {

            // AIR SUDAH BAYAR & TIDAK MELEBIHI
            // → HIJAU
            airProgress.style.setProperty(
                "background",
                "#28a745",
                "important"
            );

        }

        else {

            // BELUM BAYAR → WARNA DEFAULT
            airProgress.style.removeProperty(
                "background"
            );

        }

    }

}

    });

}


// ======================================================
// PROFILE SELECTOR
// ======================================================

function openProfileSelector() {

    const existing =
        document.querySelector(
            ".profile-selector-overlay"
        );


    if (existing) {

        existing.remove();

    }


    const html = `

        <div
            class="profile-selector-overlay"
            onclick="closeProfileSelector(event)"
        >

            <div
                class="profile-selector-sheet"
                onclick="event.stopPropagation()"
            >

                <div class="sheet-handle"></div>

                <div class="sheet-title">

                    Pilih Profil

                </div>


                <div class="profile-options">


                    <button
                        class="profile-option ${
                            currentProfileKey ===
                            "ALTUS-BRI"
                                ? "active"
                                : ""
                        }"
                        onclick="
                            switchProfile('ALTUS-BRI')
                        "
                    >

                        <div class="profile-avatar">

                            A

                        </div>

                        <div class="profile-option-info">

                            <strong>
                                ALTUS
                            </strong>

                            <span>
                                BRI
                            </span>

                        </div>

                        ${
                            currentProfileKey ===
                            "ALTUS-BRI"
                                ? `
                                    <div class="profile-check">
                                        ✓
                                    </div>
                                `
                                : ""
                        }

                    </button>


                    <button
                        class="profile-option ${
                            currentProfileKey ===
                            "BELLA-BRI"
                                ? "active"
                                : ""
                        }"
                        onclick="
                            switchProfile('BELLA-BRI')
                        "
                    >

                        <div class="profile-avatar">

                            B

                        </div>

                        <div class="profile-option-info">

                            <strong>
                                BELLA
                            </strong>

                            <span>
                                BRI
                            </span>

                        </div>

                        ${
                            currentProfileKey ===
                            "BELLA-BRI"
                                ? `
                                    <div class="profile-check">
                                        ✓
                                    </div>
                                `
                                : ""
                        }

                    </button>


                    <button
                        class="profile-option ${
                            currentProfileKey ===
                            "BELLA-BSI"
                                ? "active"
                                : ""
                        }"
                        onclick="
                            switchProfile('BELLA-BSI')
                        "
                    >

                        <div class="profile-avatar">

                            B

                        </div>

                        <div class="profile-option-info">

                            <strong>
                                BELLA
                            </strong>

                            <span>
                                BSI
                            </span>

                        </div>

                        ${
                            currentProfileKey ===
                            "BELLA-BSI"
                                ? `
                                    <div class="profile-check">
                                        ✓
                                    </div>
                                `
                                : ""
                        }

                    </button>


                </div>

            </div>

        </div>

    `;


    document.body.insertAdjacentHTML(
        "beforeend",
        html
    );

}


// ======================================================
// PINDAH PROFIL
// ======================================================

function switchProfile(
    profileKey
) {

    if (
        !profiles[profileKey]
    ) {

        return;

    }


    currentProfileKey =
        profileKey;


    saveProfiles();


    closeProfileSelector();


    updateProfileHeader();


    renderExpenseCards();


    updateDashboard();


    setupEvents();

}


// ======================================================
// TUTUP PROFILE SELECTOR
// ======================================================

function closeProfileSelector(
    event
) {

    if (
        event &&
        event.target &&
        !event.target.classList.contains(
            "profile-selector-overlay"
        )
    ) {

        return;

    }


    const overlay =
        document.querySelector(
            ".profile-selector-overlay"
        );


    if (overlay) {

        overlay.remove();

    }

}

// ======================================================
// DETAIL WIFI
// ======================================================

function openWifi() {

    const item =
        getCurrentExpenses()
        ["Wifi"];


    if (!item) {

        return;

    }


    const alreadyPaid =
        !!item.paidDate;


    const existing =
        document.querySelector(
            ".detail-overlay"
        );


    if (existing) {

        existing.remove();

    }


    const html = `

        <div
            class="detail-overlay"
            onclick="closeDetail(event)"
        >

            <div
                class="detail-sheet"
                onclick="event.stopPropagation()"
            >

                <div class="sheet-handle"></div>


                <div class="detail-header">

                    <div>

                        <div class="detail-title">
                            Wifi
                        </div>

                        <div class="detail-subtitle">
                            Tagihan bulanan
                        </div>

                    </div>


                    <button
                        class="detail-close"
                        onclick="closeDetail()"
                    >

                        ×

                    </button>

                </div>


                <div class="detail-summary">

                    <div class="detail-summary-item">

                        <span>
                            Tagihan
                        </span>

                        <strong>
                            ${rupiah(item.budget)}
                        </strong>

                    </div>


                    <div class="detail-summary-item">

                        <span>
                            Terpakai
                        </span>

                        <strong>
                            ${rupiah(item.spent)}
                        </strong>

                    </div>


                    <div class="detail-summary-item">

                        <span>
                            Status
                        </span>

                        <strong>

                            ${
                                alreadyPaid
                                    ? "Sudah Dibayar"
                                    : "Belum Dibayar"
                            }

                        </strong>

                    </div>

                </div>


                <div class="detail-progress">

                    <span
                        style="
                            width:${
                                alreadyPaid
                                    ? 100
                                    : 0
                            }%
                        "
                    ></span>

                </div>


                ${
                    alreadyPaid

                        ? `

                            <div class="paid-status">

                                <div class="paid-icon">
                                    ✓
                                </div>

                                <div>

                                    <strong>
                                        Sudah Dibayar
                                    </strong>

                                    <span>
                                        ${
                                            item.paidDate
                                                ? "Dibayar " +
                                                  item.paidDate
                                                : "Pembayaran tercatat"
                                        }
                                    </span>

                                </div>

                            </div>


                            <button
                                class="secondary-action danger-action"
                                onclick="
                                    cancelWifiPayment()
                                "
                            >

                                ↩ Batalkan Pembayaran

                            </button>

                        `

                        : `

                            <button
                                class="primary-action"
                                onclick="payWifi()"
                            >

                                ✓ Bayar Wifi Rp250.000

                            </button>

                        `

                }


                <div class="detail-note">

                    Wifi dibayar satu kali
                    setiap bulan dengan nominal
                    tetap sesuai tagihan.

                </div>

            </div>

        </div>

    `;


    document.body.insertAdjacentHTML(
        "beforeend",
        html
    );


    addDetailStyles();

}


// ======================================================
// BAYAR WIFI
// ======================================================

function payWifi() {

    const item =
        getCurrentExpenses()
        ["Wifi"];


    if (!item) {

        return;

    }


    if (item.paidDate) {

        alert(
            "Wifi bulan ini sudah dibayar."
        );

        return;

    }


    item.spent =
        Number(item.budget || 0);


    item.paidDate =
        getToday();


    saveProfiles();


    closeDetail();


    updateDashboard();


    alert(
        "Wifi berhasil dibayar " +
        rupiah(item.budget) +
        "."
    );

}


// ======================================================
// BATALKAN WIFI
// ======================================================

function cancelWifiPayment() {

    const item =
        getCurrentExpenses()
        ["Wifi"];


    if (!item) {

        return;

    }


    const confirmed =
        confirm(
            "Batalkan pembayaran Wifi bulan ini?"
        );


    if (!confirmed) {

        return;

    }


    item.spent = 0;

    item.paidDate = null;


    saveProfiles();


    closeDetail();


    updateDashboard();


    alert(
        "Pembayaran Wifi berhasil dibatalkan."
    );

}

// ======================================================
// DETAIL SEWA RUMAH
// ======================================================

function openSewaRumah() {

    const item =
        getCurrentExpenses()
        ["Sewa Rumah"];


    if (!item) {

        return;

    }


    const alreadyPaid =
        Number(item.spent || 0) >=
        Number(item.budget || 0);


    const existing =
        document.querySelector(
            ".detail-overlay"
        );


    if (existing) {

        existing.remove();

    }


    const html = `

        <div
            class="detail-overlay"
            onclick="closeDetail(event)"
        >

            <div
                class="detail-sheet"
                onclick="event.stopPropagation()"
            >

                <div class="sheet-handle"></div>


                <div class="detail-header">

                    <div>

                        <div class="detail-title">

                            Sewa Rumah

                        </div>

                        <div class="detail-subtitle">

                            Anggaran bulanan

                        </div>

                    </div>

                    <button
                        class="detail-close"
                        onclick="closeDetail()"
                    >

                        ×

                    </button>

                </div>


                <div class="detail-summary">

                    <div class="detail-summary-item">

                        <span>
                            Anggaran
                        </span>

                        <strong>
                            ${rupiah(item.budget)}
                        </strong>

                    </div>


                    <div class="detail-summary-item">

                        <span>
                            Terpakai
                        </span>

                        <strong>
                            ${rupiah(item.spent)}
                        </strong>

                    </div>


                    <div class="detail-summary-item">

                        <span>
                            Sisa
                        </span>

                        <strong>
                            ${rupiah(
                                Math.max(
                                    item.budget -
                                    item.spent,
                                    0
                                )
                            )}
                        </strong>

                    </div>

                </div>


                <div class="detail-progress">

                    <span
                        style="
                            width:${
                                item.budget > 0
                                    ? Math.min(
                                        (
                                            item.spent /
                                            item.budget
                                        ) * 100,
                                        100
                                    )
                                    : 0
                            }%
                        "
                    ></span>

                </div>


                ${
                    alreadyPaid

                    ? `

                        <div class="paid-status">

                            <div class="paid-icon">
                                ✓
                            </div>

                            <div>

                                <strong>
                                    Sudah Dibayar
                                </strong>

                                <span>
                                    ${
                                        item.paidDate
                                            ? `Dibayar ${item.paidDate}`
                                            : "Pembayaran tercatat"
                                    }
                                </span>

                            </div>

                        </div>


                        <button
                            class="secondary-action danger-action"
                            onclick="cancelSewaPayment()"
                        >

                            ↩ Batalkan Pembayaran

                        </button>

                    `

                    : `

                        <button
                            class="primary-action"
                            onclick="paySewaRumah()"
                        >

                            ✓ Tandai Sudah Dibayar

                        </button>

                    `

                }


                <div class="detail-note">

                    Pembayaran akan otomatis
                    masuk ke total pengeluaran
                    bulan ini.

                </div>


            </div>

        </div>

    `;


    document.body.insertAdjacentHTML(
        "beforeend",
        html
    );


    addDetailStyles();

}


// ======================================================
// BAYAR SEWA
// ======================================================

function paySewaRumah() {

    const item =
        getCurrentExpenses()
        ["Sewa Rumah"];


    if (!item) {

        return;

    }


    item.spent =
        Number(item.budget || 0);


    item.paidDate =
        getToday();


    saveProfiles();


    closeDetail();


    updateDashboard();


    setTimeout(() => {

        alert(
            "Sewa Rumah berhasil ditandai sudah dibayar."
        );

    }, 100);

}


// ======================================================
// BATALKAN PEMBAYARAN SEWA
// ======================================================

function cancelSewaPayment() {

    const item =
        getCurrentExpenses()
        ["Sewa Rumah"];


    if (!item) {

        return;

    }


    const confirmed =
        confirm(
            "Batalkan status pembayaran Sewa Rumah?\n\n" +
            "Pengeluaran akan kembali menjadi Rp0."
        );


    if (!confirmed) {

        return;

    }


    item.spent = 0;

    item.paidDate = null;


    saveProfiles();


    closeDetail();


    updateDashboard();


    setTimeout(() => {

        alert(
            "Pembayaran Sewa Rumah dibatalkan."
        );

    }, 100);

}

// ======================================================
// DETAIL AIR
// ======================================================

function openAir() {

    const item =
        getCurrentExpenses()
        ["Air"];


    if (!item) {

        return;

    }


    const existing =
        document.querySelector(
            ".detail-overlay"
        );


    if (existing) {

        existing.remove();

    }


    const alreadyPaid =
        !!item.paidDate;


    let action = "";


    if (alreadyPaid) {

        action = `

            <div class="paid-box">

                <div class="paid-icon">
                    ✓
                </div>

                <div>

                    <strong>
                        Sudah Dibayar
                    </strong>

                    <span>
                        Pembayaran bulan ini
                        sudah dicatat.
                    </span>

                </div>

            </div>


            <button
                class="cancel-payment-button"
                onclick="cancelAirPayment()"
            >

                ↩ Batalkan Pembayaran

            </button>

        `;

    } else {

        action = `

            <button
                class="pay-button"
                onclick="payAir()"
            >

                ✓ Bayar Air Bulan Ini

            </button>

        `;

    }


    const overlay =
        document.createElement(
            "div"
        );


    overlay.className =
        "detail-overlay";


    overlay.innerHTML = `

        <div
            class="detail-backdrop"
            onclick="closeDetail()"
        >
        </div>


        <div class="detail-sheet air-detail-sheet">

            <div class="detail-handle">
            </div>


            <div class="detail-header">

                <div>

                    <h2>
                        Air
                    </h2>

                    <p>
                        ${getCurrentProfile().name}
                        •
                        ${getCurrentProfile().bank}
                    </p>

                </div>


                <button
                    class="detail-close"
                    onclick="closeDetail()"
                >

                    ×

                </button>

            </div>


            <div class="detail-status">

                ${
                    alreadyPaid

                        ? `

                            <span class="status-paid">
                                ✓ Sudah Dibayar
                            </span>

                        `

                        : `

                            <span class="status-unpaid">
                                Belum Dibayar
                            </span>

                        `
                }

            </div>


            <div class="detail-summary">

                <div class="summary-box">

                    <span>
                        Batas Wajar
                    </span>

                    <strong>
                        ${rupiah(item.budget)}
                    </strong>

                </div>


                <div class="summary-box">

                    <span>
                        Dibayar
                    </span>

                    <strong>
                        ${rupiah(item.spent)}
                    </strong>

                </div>


                <div class="summary-box">

                    <span>
                        Status
                    </span>

                    <strong>

                        ${
                            !alreadyPaid

                                ? "Belum Dibayar"

                                : item.spent < item.budget

                                    ? "Di bawah batas"

                                    : item.spent === item.budget

                                        ? "Sesuai batas"

                                        : "Melebihi batas"
                        }

                    </strong>

                </div>

            </div>


            <div class="detail-section">

                <h3>
                    Detail
                </h3>


                <div class="detail-row">

                    <span>
                        Periode
                    </span>

                    <strong>
                        Bulanan
                    </strong>

                </div>


                <div class="detail-row">

                    <span>
                        Batas Wajar
                    </span>

                    <strong>
                        ${rupiah(item.budget)}
                    </strong>

                </div>


                <div class="detail-row">

                    <span>
                        Tanggal Bayar
                    </span>

                    <strong>
                        ${
                            item.paidDate ||
                            "Belum dibayar"
                        }
                    </strong>

                </div>

            </div>


            ${action}


            <div class="detail-note">

                Air dibayar satu kali dalam
                setiap bulan. Nominal mengikuti
                tagihan aktual.

            </div>

        </div>

    `;


    document.body.appendChild(
        overlay
    );

}

// ======================================================
// DETAIL GAS
// ======================================================

function openGas() {

    const item =
        getCurrentExpenses()
        ["Gas"];


    if (!item) {

        return;

    }


    const existing =
        document.querySelector(
            ".detail-overlay"
        );


    if (existing) {

        existing.remove();

    }


    const alreadyPaid =
        !!item.paidDate;


    let action = "";


    if (alreadyPaid) {

        action = `

            <div class="paid-box">

                <div class="paid-icon">
                    ✓
                </div>

                <div>

                    <strong>
                        Sudah Dibayar
                    </strong>

                    <span>
                        Pembayaran bulan ini
                        sudah dicatat.
                    </span>

                </div>

            </div>


            <button
                class="cancel-payment-button"
                onclick="cancelGasPayment()"
            >

                ↩ Batalkan Pembayaran

            </button>

        `;

    } else {

        action = `

            <button
                class="pay-button"
                onclick="payGas()"
            >

                ✓ Bayar Gas Bulan Ini

            </button>

        `;

    }


    const overlay =
        document.createElement(
            "div"
        );


    overlay.className =
        "detail-overlay";


    overlay.innerHTML = `

        <div
            class="detail-backdrop"
            onclick="closeDetail()"
        >
        </div>


        <div class="detail-sheet air-detail-sheet">

            <div class="detail-handle">
            </div>


            <div class="detail-header">

                <div>

                    <h2>
                        Gas
                    </h2>

                    <p>
                        ${getCurrentProfile().name}
                        •
                        ${getCurrentProfile().bank}
                    </p>

                </div>


                <button
                    class="detail-close"
                    onclick="closeDetail()"
                >

                    ×

                </button>

            </div>


            <div class="detail-status">

                ${
                    alreadyPaid

                        ? `

                            <span class="status-paid">
                                ✓ Sudah Dibayar
                            </span>

                        `

                        : `

                            <span class="status-unpaid">
                                Belum Dibayar
                            </span>

                        `
                }

            </div>


            <div class="detail-summary">

                <div class="summary-box">

                    <span>
                        Batas Wajar
                    </span>

                    <strong>
                        ${rupiah(item.budget)}
                    </strong>

                </div>


                <div class="summary-box">

                    <span>
                        Dibayar
                    </span>

                    <strong>
                        ${rupiah(item.spent)}
                    </strong>

                </div>


                <div class="summary-box">

                    <span>
                        Status
                    </span>

                    <strong>

                        ${
                            !alreadyPaid

                                ? "Belum Dibayar"

                                : item.spent < item.budget

                                    ? "Di bawah batas"

                                    : item.spent === item.budget

                                        ? "Sesuai batas"

                                        : "Melebihi batas"
                        }

                    </strong>

                </div>

            </div>


            <div class="detail-section">

                <h3>
                    Detail
                </h3>


                <div class="detail-row">

                    <span>
                        Periode
                    </span>

                    <strong>
                        Bulanan
                    </strong>

                </div>


                <div class="detail-row">

                    <span>
                        Batas Wajar
                    </span>

                    <strong>
                        ${rupiah(item.budget)}
                    </strong>

                </div>


                <div class="detail-row">

                    <span>
                        Tanggal Bayar
                    </span>

                    <strong>
                        ${
                            item.paidDate ||
                            "Belum dibayar"
                        }
                    </strong>

                </div>

            </div>


            ${action}


            <div class="detail-note">

                Gas dibayar satu kali dalam
                setiap bulan. Nominal mengikuti
                pembelian aktual.

            </div>

        </div>

    `;


    document.body.appendChild(
        overlay
    );

}

// ======================================================
// BAYAR AIR
// ======================================================

function payAir() {

    const item =
        getCurrentExpenses()
        ["Air"];


    if (!item) {

        return;

    }


    // Tidak boleh bayar dua kali
    if (item.paidDate) {

        alert(
            "Pembayaran Air bulan ini sudah tercatat."
        );

        return;

    }


    const input =
        prompt(
            "Masukkan nominal pembayaran Air.\n\n" +
            "Batas wajar: " +
            rupiah(item.budget)
        );


    if (
        input === null
    ) {

        return;

    }


    // Bersihkan input
    let clean =
        String(input)
            .trim()
            .toLowerCase()
            .replace(/rp/g, "")
            .replace(/\s/g, "")
            .replace(/\./g, "")
            .replace(/,/g, "");


    const amount =
        Number(clean);


    // Validasi nominal
    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert(
            "Nominal pembayaran tidak valid."
        );

        return;

    }


    // Simpan pembayaran
    item.spent =
        amount;


    item.paidDate =
        getToday();


    // Simpan data
    saveProfiles();


    // Tutup detail
    closeDetail();


    // Update dashboard
    updateDashboard();


    // Notifikasi
    setTimeout(() => {

        let message =
            "Pembayaran Air berhasil dicatat.\n\n" +
            "Nominal: " +
            rupiah(amount);


        if (
            amount < item.budget
        ) {

            message +=
                "\nSisa dari batas wajar: " +
                rupiah(
                    item.budget - amount
                );

        }

        else if (
            amount === item.budget
        ) {

            message +=
                "\nSesuai batas wajar.";

        }

        else {

            message +=
                "\nMelebihi batas wajar: " +
                rupiah(
                    amount - item.budget
                );

        }


        alert(message);

    }, 100);

}

// ======================================================
// BAYAR GAS
// ======================================================

function payGas() {

    const item =
        getCurrentExpenses()
        ["Gas"];


    if (!item) {

        return;

    }


    // Tidak boleh bayar dua kali
    if (item.paidDate) {

        alert(
            "Pembayaran Gas bulan ini sudah tercatat."
        );

        return;

    }


    const input =
        prompt(
            "Masukkan nominal pembayaran Gas.\n\n" +
            "Batas wajar: " +
            rupiah(item.budget)
        );


    if (
        input === null
    ) {

        return;

    }


    // Bersihkan input
    let clean =
        String(input)
            .trim()
            .toLowerCase()
            .replace(/rp/g, "")
            .replace(/\s/g, "")
            .replace(/\./g, "")
            .replace(/,/g, "");


    const amount =
        Number(clean);


    // Validasi nominal
    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert(
            "Nominal pembayaran tidak valid."
        );

        return;

    }


    // Simpan pembayaran
    item.spent =
        amount;


    item.paidDate =
        getToday();


    // Simpan data
    saveProfiles();


    // Tutup detail
    closeDetail();


    // Update tampilan
    updateDashboard();


    setTimeout(() => {

        let message =
            "Pembayaran Gas berhasil dicatat.\n\n" +
            "Nominal: " +
            rupiah(amount);


        if (
            amount < item.budget
        ) {

            message +=
                "\nSisa dari batas wajar: " +
                rupiah(
                    item.budget -
                    amount
                );

        }

        else if (
            amount === item.budget
        ) {

            message +=
                "\nSesuai batas wajar.";

        }

        else {

            message +=
                "\nMelebihi batas wajar: " +
                rupiah(
                    amount -
                    item.budget
                );

        }


        alert(message);

    }, 100);

}

// ======================================================
// BATALKAN PEMBAYARAN AIR
// ======================================================

function cancelAirPayment() {

    const item =
        getCurrentExpenses()
        ["Air"];


    if (!item) {

        return;

    }


    const confirmCancel =
        confirm(
            "Batalkan pembayaran Air bulan ini?"
        );


    if (!confirmCancel) {

        return;

    }


    // Reset pembayaran Air
    item.spent = 0;
    item.paidDate = null;


    // Simpan perubahan
    saveProfiles();


    // Tutup detail
    closeDetail();


    // Update dashboard
    updateDashboard();


    alert(
        "Pembayaran Air berhasil dibatalkan."
    );

}

// ======================================================
// BATALKAN PEMBAYARAN GAS
// ======================================================

function cancelGasPayment() {

    const item =
        getCurrentExpenses()
        ["Gas"];


    if (!item) {

        return;

    }


    const confirmCancel =
        confirm(
            "Batalkan pembayaran Gas bulan ini?"
        );


    if (!confirmCancel) {

        return;

    }


    // Reset pembayaran Gas
    item.spent = 0;
    item.paidDate = null;


    // Simpan perubahan
    saveProfiles();


    // Tutup detail
    closeDetail();


    // Update dashboard
    updateDashboard();


    alert(
        "Pembayaran Gas berhasil dibatalkan."
    );

}

// ======================================================
// TUTUP DETAIL
// ======================================================

function closeDetail(
    event
) {

    if (
        event &&
        event.target &&
        !event.target.classList.contains(
            "detail-overlay"
        )
    ) {

        return;

    }


    const overlay =
        document.querySelector(
            ".detail-overlay"
        );


    if (overlay) {

        overlay.remove();

    }

}

// ======================================================
// MESIN TRANSAKSI PENGELUARAN BERULANG
// NYUCI • GALON • BENSIN
// ======================================================

function openRepeatingExpense(
    name,
    subtitle,
    buttonsHtml,
    customButtonHtml
) {

    const item =
        getCurrentExpenses()[name];


    if (!item) {

        return;

    }


    if (!Array.isArray(item.history)) {

        item.history = [];

    }


    const percentage =
        item.budget > 0
            ? Math.min(
                (
                    Number(item.spent || 0) /
                    Number(item.budget || 0)
                ) * 100,
                100
            )
            : 0;


    const existing =
        document.querySelector(
            ".repeating-expense-overlay"
        );


    if (existing) {

        existing.remove();

    }


    const html = `

        <div
            class="electricity-overlay repeating-expense-overlay"
            onclick="closeRepeatingExpense(event)"
        >

            <div
                class="electricity-sheet"
                onclick="event.stopPropagation()"
            >

                <div class="sheet-handle"></div>


                <div class="electricity-header">

                    <div>

                        <div class="electricity-title">

                            ${name}

                        </div>

                        <div class="electricity-subtitle">

                            ${subtitle}

                        </div>

                    </div>


                    <button
                        class="electricity-close"
                        onclick="closeRepeatingExpense()"
                    >

                        ×

                    </button>

                </div>


                <div class="electricity-summary">

                    <div class="electricity-summary-item">

                        <span>
                            Anggaran
                        </span>

                        <strong>
                            ${rupiah(item.budget)}
                        </strong>

                    </div>


                    <div class="electricity-summary-item">

                        <span>
                            Terpakai
                        </span>

                        <strong>
                            ${rupiah(item.spent)}
                        </strong>

                    </div>


                    <div class="electricity-summary-item">

                        <span>
                            Sisa
                        </span>

                        <strong>
                            ${rupiah(
                                Math.max(
                                    item.budget -
                                    item.spent,
                                    0
                                )
                            )}
                        </strong>

                    </div>

                </div>


                <div class="electricity-progress">

                    <span
                        style="
                            width:${percentage}%
                        "
                    ></span>

                </div>


                <div class="electricity-section-title">

                    Tambah Pengeluaran

                </div>


                <div class="electricity-buttons">

                    ${buttonsHtml}

                    ${customButtonHtml}

                </div>


                <div class="electricity-section-title">

                    Riwayat

                </div>


                <div class="electricity-history">

                    ${renderRepeatingHistory(item, name)}

                </div>


            </div>

        </div>

    `;


    document.body.insertAdjacentHTML(
        "beforeend",
        html
    );


    addElectricityStyles();

}


// ======================================================
// RIWAYAT TRANSAKSI UMUM
// ======================================================

// ======================================================
// RIWAYAT TRANSAKSI UMUM
// ======================================================

function renderRepeatingHistory(
    item,
    name
) {

    if (
        !item.history ||
        item.history.length === 0
    ) {

        return `

            <div class="electricity-empty">

                Belum ada transaksi bulan ini.

            </div>

        `;

    }


    return item.history

        .map(
            (
                transaction,
                index
            ) => `

                <div
                    class="electricity-history-item"
                >

                    <div
                        class="electricity-history-main"
                    >

                        <div>

                            <strong>

                                ${rupiah(
                                    Number(
                                        transaction.amount || 0
                                    )
                                )}

                            </strong>


                            <span>

                                ${escapeHtml(
                                    transaction.label ||
                                    "-"
                                )}

                            </span>


                            <small
                                style="
                                    display:block;
                                    margin-top:3px;
                                    color:#7a8a96;
                                    font-size:10px;
                                "
                            >

                                ${escapeHtml(
                                    transaction.date ||
                                    "-"
                                )}

                            </small>

                        </div>


                        <span
                            class="electricity-history-label"
                        >

                            ${escapeHtml(name)}

                        </span>

                    </div>


                    <button
                        type="button"
                        class="electricity-delete-button"
                        onclick="
                            event.stopPropagation();
                            deleteRepeatingExpense(
                                '${name}',
                                ${index}
                            );
                        "
                    >

                        🗑 Hapus

                    </button>

                </div>

            `
        )

        .reverse()

        .join("");

}


// ======================================================
// TAMBAH TRANSAKSI UMUM
// ======================================================

function addRepeatingExpense(
    name,
    amount,
    label
) {

    const item =
        getCurrentExpenses()[name];


    if (!item) {

        return;

    }


    const numericAmount =
        Number(amount);


    if (
        !Number.isFinite(
            numericAmount
        ) ||
        numericAmount <= 0
    ) {

        alert(
            "Nominal tidak valid."
        );

        return;

    }


    if (
        !Array.isArray(
            item.history
        )
    ) {

        item.history = [];

    }


    item.history.push({

        amount:
            numericAmount,

        label:
            label || "Transaksi",

        date:
            getToday()

    });


    item.spent =
        Number(item.spent || 0) +
        numericAmount;


    saveProfiles();


    closeRepeatingExpense();


    updateDashboard();


    setTimeout(() => {

        alert(
            name +
            " berhasil dicatat.\n\n" +
            "Nominal: " +
            rupiah(numericAmount)
        );

    }, 100);

}


// ======================================================
// NOMINAL MANUAL
// ======================================================

function addCustomRepeatingExpense(
    name
) {

    const input =
        prompt(
            "Masukkan nominal " +
            name +
            "."
        );


    if (
        input === null
    ) {

        return;

    }


    let clean =
        String(input)
            .trim()
            .toLowerCase()
            .replace(/rp/g, "")
            .replace(/\s/g, "")
            .replace(/\./g, "")
            .replace(/,/g, "");


    const amount =
        Number(clean);


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert(
            "Nominal tidak valid."
        );

        return;

    }


    addRepeatingExpense(
        name,
        amount,
        "Nominal Lain"
    );

}

// ======================================================
// NOMINAL + KETERANGAN
// ======================================================

function addCustomRepeatingExpenseWithNote(
    name
) {

    const input =
        prompt(
            "Masukkan nominal " +
            name +
            "."
        );

    if (input === null) {
        return;
    }

    let clean =
        String(input)
            .trim()
            .toLowerCase()
            .replace(/rp/g, "")
            .replace(/\s/g, "")
            .replace(/\./g, "")
            .replace(/,/g, "");

    const amount =
        Number(clean);

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert(
            "Nominal tidak valid."
        );

        return;
    }

    const note =
        prompt(
            "Untuk apa / beli apa?\n\n" +
            "Contoh: Beli susu, makan siang, beli mainan."
        );

    if (note === null) {
        return;
    }

    const cleanNote =
        String(note).trim();

    if (!cleanNote) {

        alert(
            "Keterangan tidak boleh kosong."
        );

        return;
    }

    addRepeatingExpense(
        name,
        amount,
        cleanNote
    );

}

// ======================================================
// HAPUS TRANSAKSI
// ======================================================

function deleteRepeatingExpense(
    name,
    index
) {

    const item =
        getCurrentExpenses()[name];


    if (!item) {

        return;

    }


    if (
        !Array.isArray(
            item.history
        )
    ) {

        return;

    }


    const transaction =
        item.history[index];


    if (!transaction) {

        return;

    }


    const amount =
        Number(
            transaction.amount || 0
        );


    const confirmed =
        confirm(
            "Hapus transaksi " +
            rupiah(amount) +
            "?"
        );


    if (!confirmed) {

        return;

    }


    item.history.splice(
        index,
        1
    );


    item.spent =
        Math.max(
            Number(item.spent || 0) -
            amount,
            0
        );


    saveProfiles();


    openRepeatingExpenseByName(
        name
    );


    updateDashboard();

}


// ======================================================
// BUKA ULANG DETAIL
// ======================================================

function openRepeatingExpenseByName(
    name
) {

    if (
        name === "Nyuci"
    ) {

        openNyuci();

    }

    else if (
        name === "Galon"
    ) {

        openGalon();

    }

    else if (
        name === "Bensin"
    ) {

        openBensin();

    }

    else if (
        name === "Jajan/Main/Lainnya"
    ) {

        openJajanMainLainnya();

    }

    else if (
        name === "Susu & Pempers"
    ) {

        openSusuPempers();

    }

    else if (
        name === "Gojek Sekolah"
    ) {

        openGojekSekolah();

    }

    else if (
        name === "Paylater (Jika Ada)"
    ) {

        openPaylater();

    }

}


// ======================================================
// TUTUP DETAIL
// ======================================================

function closeRepeatingExpense(
    event
) {

    if (
        event &&
        event.target &&
        !event.target.classList.contains(
            "repeating-expense-overlay"
        )
    ) {

        return;

    }


    const overlay =
        document.querySelector(
            ".repeating-expense-overlay"
        );


    if (overlay) {

        overlay.remove();

    }

}


// ======================================================
// DETAIL NYUCI
// ======================================================

function openNyuci() {

    openRepeatingExpense(

        "Nyuci",

        "Pengeluaran laundry bulan ini",

        `

            <button
                type="button"
                onclick="
                    addRepeatingExpense(
                        'Nyuci',
                        17500,
                        'Cuci'
                    )
                "
            >

                Cuci<br>
                <strong>Rp17.500</strong>

            </button>


            <button
                type="button"
                onclick="
                    addRepeatingExpense(
                        'Nyuci',
                        17500,
                        'Dryer'
                    )
                "
            >

                Dryer<br>
                <strong>Rp17.500</strong>

            </button>


            <button
                type="button"
                onclick="
                    addRepeatingExpense(
                        'Nyuci',
                        35000,
                        'Cuci + Dryer'
                    )
                "
            >

                Cuci + Dryer<br>
                <strong>Rp35.000</strong>

            </button>

        `,

        `

            <button
                type="button"
                class="electricity-custom-button"
                onclick="
                    addCustomRepeatingExpense(
                        'Nyuci'
                    )
                "
            >

                Nominal Lain

            </button>

        `

    );

}


// ======================================================
// DETAIL GALON
// ======================================================

function openGalon() {

    openRepeatingExpense(

        "Galon",

        "Pembelian galon bulan ini",

        `

            <button
                type="button"
                onclick="
                    addRepeatingExpense(
                        'Galon',
                        23000,
                        'Beli Galon'
                    )
                "
            >

                Beli Galon<br>
                <strong>Rp23.000</strong>

            </button>

        `,

        ""

    );

}


// ======================================================
// DETAIL BENSIN
// ======================================================

function openBensin() {

    openRepeatingExpense(

        "Bensin",

        "Pengeluaran bensin bulan ini",

        `

            <button
                type="button"
                onclick="
                    addCustomRepeatingExpense(
                        'Bensin'
                    )
                "
            >

                + Masukkan Nominal

            </button>

        `,

        ""

    );

}

// ======================================================
// BELLA BRI - PENGELUARAN BERULANG
// ======================================================

function openBelanjaPasar() {

    openRepeatingExpense(
        "Belanja Pasar",
        "Belanja dapat dilakukan beberapa kali dalam bulan ini.",
        "",
        `
        <button
            class="electricity-action custom"
            onclick="addCustomRepeatingExpense('Belanja Pasar')"
        >
            + Masukkan Nominal
        </button>
        `
    );

}


function openBeras() {

    openRepeatingExpense(
        "Beras",
        "Pembelian beras dapat dilakukan beberapa kali dalam bulan ini.",
        "",
        `
        <button
            class="electricity-action custom"
            onclick="addCustomRepeatingExpense('Beras')"
        >
            + Masukkan Nominal
        </button>
        `
    );

}


function openMinyakManis() {

    openRepeatingExpense(
        "Minyak Manis",
        "Pembelian dapat dilakukan beberapa kali dalam bulan ini.",
        "",
        `
        <button
            class="electricity-action custom"
            onclick="addCustomRepeatingExpense('Minyak Manis')"
        >
            + Masukkan Nominal
        </button>
        `
    );

}

// ======================================================
// BELLA BSI - PENGELUARAN BERULANG
// ======================================================

// JAJAN / MAIN / LAINNYA
function openJajanMainLainnya() {

    openRepeatingExpense(

        "Jajan/Main/Lainnya",

        "Pengeluaran bebas bulan ini",

        `
            <button
                type="button"
                onclick="
                    addCustomRepeatingExpenseWithNote(
                        'Jajan/Main/Lainnya'
                    )
                "
            >

                + Masukkan Nominal

            </button>
        `,

        ""

    );

}


// SUSU & PEMPERS
function openSusuPempers() {

    openRepeatingExpense(

        "Susu & Pempers",

        "Pembelian susu dan pempers bulan ini",

        `
            <button
                type="button"
                onclick="
                    addCustomRepeatingExpenseWithNote(
                        'Susu & Pempers'
                    )
                "
            >

                + Masukkan Nominal

            </button>
        `,

        ""

    );

}


// GOJEK SEKOLAH
function openGojekSekolah() {

    openRepeatingExpense(

        "Gojek Sekolah",

        "Pengeluaran Gojek sekolah bulan ini",

        `
            <button
                type="button"
                onclick="
                    addCustomRepeatingExpense(
                        'Gojek Sekolah'
                    )
                "
            >

                + Masukkan Nominal

            </button>
        `,

        ""

    );

}


// PAYLATER
function openPaylater() {

    openRepeatingExpense(

        "Paylater (Jika Ada)",

        "Pengeluaran Paylater bulan ini",

        `
            <button
                type="button"
                onclick="
                    addCustomRepeatingExpenseWithNote(
                        'Paylater (Jika Ada)'
                    )
                "
            >

                + Masukkan Nominal

            </button>
        `,

        ""

    );

}

// ======================================================
// DETAIL LISTRIK
// ======================================================

function openListrik() {

    const item =
        getCurrentExpenses()
        ["Listrik"];


    if (!item) {

        return;

    }


    if (!Array.isArray(item.history)) {

        item.history = [];

    }


    const remaining =
        Math.max(
            Number(item.budget || 0) -
            Number(item.spent || 0),
            0
        );


    const percentage =
        item.budget > 0

            ? Math.min(
                (
                    Number(item.spent || 0) /
                    Number(item.budget || 0)
                ) * 100,
                100
            )

            : 0;


    const existing =
        document.querySelector(
            ".electricity-overlay"
        );


    if (existing) {

        existing.remove();

    }


    const html = `

        <div
            class="electricity-overlay"
            onclick="closeListrik(event)"
        >

            <div
                class="electricity-sheet"
                onclick="event.stopPropagation()"
            >

                <div class="sheet-handle"></div>


                <div class="electricity-header">

                    <div>

                        <div class="electricity-title">

                            Listrik

                        </div>

                        <div class="electricity-subtitle">

                            Pengisian token bulan ini

                        </div>

                    </div>


                    <button
                        class="electricity-close"
                        onclick="closeListrik()"
                    >

                        ×

                    </button>

                </div>


                <!-- ==================================
                     RINGKASAN
                =================================== -->

                <div class="electricity-summary">


                    <div class="electricity-summary-item">

                        <span>
                            Anggaran
                        </span>

                        <strong>
                            ${rupiah(item.budget)}
                        </strong>

                    </div>


                    <div class="electricity-summary-item">

                        <span>
                            Terpakai
                        </span>

                        <strong>
                            ${rupiah(item.spent)}
                        </strong>

                    </div>


                    <div class="electricity-summary-item">

                        <span>
                            Sisa
                        </span>

                        <strong>
                            ${rupiah(remaining)}
                        </strong>

                    </div>


                </div>


                <!-- ==================================
                     PROGRESS
                =================================== -->

                <div class="electricity-progress">

                    <span
                        style="
                            width:${percentage}%
                        "
                    ></span>

                </div>


                <!-- ==================================
                     PILIH NOMINAL
                =================================== -->

                <div class="electricity-section-title">

                    Tambah Token

                </div>


                <div class="electricity-buttons">


                    <button
                        type="button"
                        onclick="
                            addElectricityExpense(50000)
                        "
                        
                    >

                        Rp50.000

                    </button>


                    <button
                        type="button"
                        onclick="
                            addElectricityExpense(100000)
                        "
                        
                    >

                        Rp100.000

                    </button>


                    <button
                        type="button"
                        onclick="
                            addElectricityExpense(150000)
                        "
                        
                    >

                        Rp150.000

                    </button>


                    <button
                        type="button"
                        class="electricity-custom-button"
                        onclick="
                            openCustomElectricity()
                        "
                        
                    >

                        Nominal Lain

                    </button>


                </div>


                <!-- ==================================
                     RIWAYAT
                =================================== -->

                <div class="electricity-section-title">

                    Riwayat Token

                </div>


                <div class="electricity-history">

                    ${renderElectricityHistory(item)}

                </div>


            </div>

        </div>

    `;


    document.body.insertAdjacentHTML(
        "beforeend",
        html
    );


    addElectricityStyles();

}


// ======================================================
// RIWAYAT TOKEN LISTRIK
// ======================================================

function renderElectricityHistory(item) {

    if (
        !item.history ||
        item.history.length === 0
    ) {

        return `

            <div class="electricity-empty">

                Belum ada pengisian token
                bulan ini.

            </div>

        `;

    }


    return item.history

        .map(
            (
                transaction,
                index
            ) => ({

                transaction,

                index

            })
        )

        .reverse()

        .map(
            ({
                transaction,
                index
            }) => `

                <div
                    class="electricity-history-item"
                >

                    <div
                        class="electricity-history-main"
                    >

                        <div>

                            <strong>

                                ${rupiah(
                                    Number(
                                        transaction.amount || 0
                                    )
                                )}

                            </strong>


                            <span>

                                ${escapeHtml(
                                    transaction.date ||
                                    "-"
                                )}

                            </span>

                        </div>


                        <span
                            class="electricity-history-label"
                        >

                            Token Listrik

                        </span>

                    </div>


                    <!-- ==========================
                         TOMBOL HAPUS
                    =========================== -->

                    <button
                        type="button"
                        class="electricity-delete-button"
                        onclick="
                            event.stopPropagation();
                            deleteElectricityTransaction(
                                ${index}
                            );
                        "
                    >

                        🗑 Hapus

                    </button>


                </div>

            `
        )

        .join("");

}


// ======================================================
// TAMBAH TOKEN LISTRIK
// ======================================================

function addElectricityExpense(
    amount
) {

    const item =
        getCurrentExpenses()
        ["Listrik"];


    if (!item) {

        return;

    }


    const numericAmount =
        Number(amount);


    if (
        !Number.isFinite(
            numericAmount
        ) ||
        numericAmount <= 0
    ) {

        alert(
            "Nominal token tidak valid."
        );

        return;

    }


    


   


    // ==============================================
    // PASTIKAN HISTORY ADA
    // ==============================================

    if (
        !Array.isArray(
            item.history
        )
    ) {

        item.history = [];

    }


    // ==============================================
    // SIMPAN TRANSAKSI
    // ==============================================

    item.history.push({

        amount:
            numericAmount,

        date:
            getToday()

    });


    // ==============================================
    // TAMBAHKAN KE TOTAL TERPAKAI
    // ==============================================

    item.spent =
        Number(item.spent || 0) +
        numericAmount;


    // ==============================================
    // SIMPAN
    // ==============================================

    saveProfiles();


    // ==============================================
    // TUTUP DETAIL
    // ==============================================

    closeListrik();


    // ==============================================
    // UPDATE DASHBOARD
    // ==============================================

    updateDashboard();


    // ==============================================
    // NOTIFIKASI
    // ==============================================

    setTimeout(() => {

        alert(
            "Token Listrik berhasil dicatat.\n\n" +
            "Nominal: " +
            rupiah(numericAmount) +
            "\n" +
            "Sisa anggaran: " +
            rupiah(
                Math.max(
                    Number(item.budget || 0) -
                    Number(item.spent || 0),
                    0
                )
            )
        );

    }, 100);

}


// ======================================================
// NOMINAL TOKEN CUSTOM
// ======================================================

function openCustomElectricity() {

    const item =
        getCurrentExpenses()
        ["Listrik"];


    if (!item) {

        return;

    }


    const remaining =
        Math.max(
            Number(item.budget || 0) -
            Number(item.spent || 0),
            0
        );





    const input =
        prompt(
            "Masukkan nominal token listrik.\n\n" +
            "Target bulan ini: " +
            rupiah(item.budget)
        );


    if (
        input === null
    ) {

        return;

    }


    // ==============================================
    // BERSIHKAN INPUT
    // ==============================================

    let clean =
        String(input)
            .trim()
            .toLowerCase()
            .replace(/rp/g, "")
            .replace(/\s/g, "")
            .replace(/\./g, "")
            .replace(/,/g, "");


    const amount =
        Number(clean);


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert(
            "Nominal tidak valid."
        );

        return;

    }


    


    addElectricityExpense(
        amount
    );

}


// ======================================================
// HAPUS SATU TRANSAKSI TOKEN LISTRIK
// ======================================================

function deleteElectricityTransaction(
    index
) {

    const item =
        getCurrentExpenses()
        ["Listrik"];


    if (!item) {

        return;

    }


    if (
        !Array.isArray(
            item.history
        )
    ) {

        return;

    }


    if (
        index < 0 ||
        index >= item.history.length
    ) {

        return;

    }


    const transaction =
        item.history[index];


    const amount =
        Number(
            transaction.amount || 0
        );


    // ==============================================
    // KONFIRMASI
    // ==============================================

    const confirmed =
        confirm(

            "Hapus transaksi Token Listrik " +
            rupiah(amount) +
            "?\n\n" +

            "Nominal ini akan dikembalikan " +
            "ke sisa anggaran."

        );


    if (!confirmed) {

        return;

    }


    // ==============================================
    // HAPUS HISTORY
    // ==============================================

    item.history.splice(
        index,
        1
    );


    // ==============================================
    // KEMBALIKAN NOMINAL KE ANGGARAN
    // ==============================================

    item.spent =
        Math.max(
            Number(item.spent || 0) -
            amount,
            0
        );


    // ==============================================
    // JAGA AGAR TIDAK MELEBIHI BUDGET
    // ==============================================

    if (
        item.spent >
        item.budget
    ) {

        item.spent =
            item.budget;

    }


    // ==============================================
    // SIMPAN DATA
    // ==============================================

    saveProfiles();


    // ==============================================
    // UPDATE DASHBOARD
    // ==============================================

    updateDashboard();


    // ==============================================
    // TUTUP SHEET LAMA
    // ==============================================

    closeListrik();


    // ==============================================
    // BUKA KEMBALI AGAR RIWAYAT TERUPDATE
    // ==============================================

    setTimeout(() => {

        openListrik();

    }, 50);

}


// ======================================================
// TUTUP DETAIL LISTRIK
// ======================================================

function closeListrik(
    event
) {

    if (
        event &&
        event.target &&
        !event.target.classList.contains(
            "electricity-overlay"
        )
    ) {

        return;

    }


    const overlay =
        document.querySelector(
            ".electricity-overlay"
        );


    if (overlay) {

        overlay.remove();

    }

}


// ======================================================
// STYLE DETAIL LISTRIK
// ======================================================

function addElectricityStyles() {

    if (
        document.getElementById(
            "electricity-styles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "electricity-styles";


    style.textContent = `

        .electricity-overlay {

            position: fixed;

            inset: 0;

            background:
                rgba(15, 23, 42, .42);

            z-index: 9999;

            display: flex;

            align-items: flex-end;

        }


        .electricity-sheet {

            width: 100%;

            max-width: 560px;

            margin: 0 auto;

            background: #fff;

            border-radius:
                24px 24px 0 0;

            padding:
                10px 18px
                calc(
                    22px +
                    env(
                        safe-area-inset-bottom
                    )
                );

            max-height: 92vh;

            overflow-y: auto;

            box-sizing: border-box;

            box-shadow:
                0 -10px 40px
                rgba(0,0,0,.14);

        }


        .sheet-handle {

            width: 42px;

            height: 5px;

            border-radius: 99px;

            background: #d5dbe2;

            margin:
                4px auto
                18px;

        }


        .electricity-header {

            display: flex;

            align-items: flex-start;

            justify-content: space-between;

            gap: 12px;

            margin-bottom: 18px;

        }


        .electricity-title {

            font-size: 22px;

            font-weight: 800;

            color: #0f172a;

        }


        .electricity-subtitle {

            margin-top: 4px;

            font-size: 13px;

            color: #64748b;

        }


        .electricity-close {

            border: 0;

            background: #f1f5f9;

            width: 36px;

            height: 36px;

            border-radius: 50%;

            font-size: 24px;

            line-height: 1;

            color: #334155;

            cursor: pointer;

        }


        .electricity-summary {

            display: grid;

            grid-template-columns:
                repeat(3, minmax(0, 1fr));

            gap: 8px;

            margin-bottom: 12px;

        }


        .electricity-summary-item {

            min-width: 0;

            background: #f8fafc;

            border-radius: 14px;

            padding: 12px 10px;

        }


        .electricity-summary-item span {

            display: block;

            font-size: 11px;

            color: #64748b;

            margin-bottom: 5px;

        }


        .electricity-summary-item strong {

            display: block;

            font-size: 13px;

            color: #0f172a;

            overflow-wrap: anywhere;

        }


        .electricity-progress {

            height: 8px;

            background: #e2e8f0;

            border-radius: 99px;

            overflow: hidden;

            margin-bottom: 22px;

        }


        .electricity-progress span {

            display: block;

            height: 100%;

            background: #005658;

            border-radius: inherit;

            transition:
                width .25s ease;

        }


        .electricity-section-title {

            font-size: 15px;

            font-weight: 800;

            color: #0f172a;

            margin:
                18px 0
                10px;

        }


        .electricity-buttons {

            display: grid;

            grid-template-columns:
                repeat(2, minmax(0, 1fr));

            gap: 10px;

        }


        .electricity-buttons button {

            border: 1px solid #dbe4ea;

            background: #fff;

            color: #005658;

            min-height: 48px;

            border-radius: 13px;

            font-size: 14px;

            font-weight: 800;

            cursor: pointer;

        }


        .electricity-buttons button:active {

            transform: scale(.98);

        }


        .electricity-buttons button:disabled {

            opacity: .42;

            cursor: not-allowed;

        }


        .electricity-custom-button {

            background: #005658 !important;

            color: #fff !important;

            border-color: #005658 !important;

        }


        .electricity-history {

            display: flex;

            flex-direction: column;

            gap: 8px;

        }


        .electricity-history-item {

            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 12px;

            padding: 12px;

            border: 1px solid #e5e7eb;

            border-radius: 14px;

            background: #fff;

        }


        .electricity-history-main {

            min-width: 0;

            flex: 1;

            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 10px;

        }


        .electricity-history-main > div {

            min-width: 0;

        }


        .electricity-history-main strong {

            display: block;

            color: #0f172a;

            font-size: 14px;

        }


        .electricity-history-main span {

            display: block;

            margin-top: 3px;

            color: #64748b;

            font-size: 11px;

        }


        .electricity-history-label {

            color: #005658 !important;

            background: #e7f5f4;

            border-radius: 99px;

            padding: 5px 8px;

            white-space: nowrap;

        }


        .electricity-delete-button {

            flex: 0 0 auto;

            border: 0;

            background: #fff1f2;

            color: #be123c;

            border-radius: 9px;

            padding: 8px 10px;

            font-size: 11px;

            font-weight: 800;

            cursor: pointer;

        }


        .electricity-delete-button:active {

            transform: scale(.97);

        }


        .electricity-empty {

            padding: 18px 12px;

            border-radius: 14px;

            background: #f8fafc;

            color: #64748b;

            text-align: center;

            font-size: 13px;

        }


        @media (max-width: 420px) {

            .electricity-history-main {

                flex-direction: column;

                align-items: flex-start;

            }


            .electricity-history-item {

                align-items: flex-start;

            }


            .electricity-delete-button {

                margin-top: 2px;

            }

        }

    `;


    document.head.appendChild(
        style
    );

}

// ======================================================
// PENGATURAN ANGGARAN
// ======================================================

function openBudgetSettings() {

    const expenses =
        getCurrentExpenses();


    const existing =
        document.querySelector(
            ".budget-settings-overlay"
        );


    if (existing) {

        existing.remove();

    }


    let rows = "";


    Object.keys(expenses)
        .forEach(name => {

            const item =
                expenses[name];


            rows += `

                <div
                    class="budget-setting-row"
                >

                    <div
                        class="budget-setting-info"
                    >

                        <strong>

                            ${escapeHtml(name)}

                        </strong>

                        <span>

                            Saat ini
                            ${rupiah(item.budget)}

                        </span>

                    </div>


                    <input
                        type="number"
                        class="budget-input"
                        data-budget-name="${escapeHtml(name)}"
                        value="${Number(item.budget || 0)}"
                        min="0"
                        step="1000"
                        oninput="updateBudgetPreview()"
                    >

                </div>

            `;

        });


    const html = `

        <div
            class="budget-settings-overlay"
            onclick="closeBudgetSettings(event)"
        >

            <div
                class="budget-settings-sheet"
                onclick="event.stopPropagation()"
            >

                <div class="sheet-handle"></div>


                <div class="budget-settings-header">

                    <div>

                        <div class="budget-settings-title">

                            Atur Anggaran

                        </div>

                        <div class="budget-settings-subtitle">

                            ${getCurrentProfile().name}
                            •
                            ${getCurrentProfile().bank}

                        </div>

                    </div>


                    <button
                        class="budget-settings-close"
                        onclick="closeBudgetSettings()"
                    >

                        ×

                    </button>

                </div>


                <div
                    class="budget-preview"
                    id="budget-preview"
                >

                    Total anggaran:
                    <strong>
                        ${rupiah(getBudgetTotal())}
                    </strong>

                </div>


                <div
                    class="budget-settings-list"
                >

                    ${rows}

                </div>


                <button
                    type="button"
                    class="budget-save-button"
                    onclick="saveBudgetSettings()"
                >

                    Simpan Anggaran

                </button>


                <div class="budget-settings-note">

                    Perubahan hanya berlaku
                    pada profil yang sedang dipilih.

                </div>


            </div>

        </div>

    `;


    document.body.insertAdjacentHTML(
        "beforeend",
        html
    );


    addBudgetSettingsStyles();

}


// ======================================================
// PREVIEW TOTAL ANGGARAN
// ======================================================

function updateBudgetPreview() {

    const inputs =
        document.querySelectorAll(
            ".budget-input"
        );


    let total = 0;


    inputs.forEach(input => {

        const value =
            Number(input.value || 0);


        if (
            Number.isFinite(value) &&
            value > 0
        ) {

            total += value;

        }

    });


    const preview =
        document.querySelector(
            "#budget-preview"
        );


    if (preview) {

        preview.innerHTML = `

            Total anggaran:

            <strong>
                ${rupiah(total)}
            </strong>

        `;

    }

}


// ======================================================
// SIMPAN ANGGARAN
// ======================================================

// ======================================================
// SIMPAN ANGGARAN - FINAL
// ======================================================

function saveBudgetSettings() {

    const expenses =
        getCurrentExpenses();


    const inputs =
        document.querySelectorAll(
            "[data-budget-name]"
        );


    inputs.forEach(input => {

        const name =
            input.dataset.budgetName;


        if (
            !expenses[name]
        ) {

            return;

        }


        let value =
            Number(input.value);


        if (
            !Number.isFinite(value) ||
            value < 0
        ) {

            value = 0;

        }


        // ==========================================
        // UPDATE ANGGARAN
        // ==========================================

        expenses[name].budget =
            value;


        // ==========================================
        // JIKA ANGGARAN TURUN DI BAWAH TERPAKAI
        // ==========================================

        if (
            Number(expenses[name].spent || 0) >
            value
        ) {

            expenses[name].spent =
                value;

        }

    });


    // ==============================================
    // SIMPAN KE LOCAL STORAGE
    // ==============================================

    saveProfiles();


    // ==============================================
    // TUTUP POPUP
    // ==============================================

    closeBudgetSettings();


    // ==============================================
    // RENDER ULANG KARTU
    // ==============================================

    renderExpenseCards();


    // ==============================================
    // UPDATE DASHBOARD
    // ==============================================

    updateDashboard();


    // ==============================================
    // EVENT KARTU
    // ==============================================

    setupEvents();


    // ==============================================
    // TOMBOL EDIT ANGGARAN
    // ==============================================

    addBudgetButton();


    setTimeout(() => {

        alert(
            "Anggaran berhasil diperbarui."
        );

    }, 150);

}


// ======================================================
// TUTUP PENGATURAN ANGGARAN
// ======================================================

function closeBudgetSettings(
    event
) {

    if (
        event &&
        event.target &&
        !event.target.classList.contains(
            "budget-settings-overlay"
        )
    ) {

        return;

    }


    const overlay =
        document.querySelector(
            ".budget-settings-overlay"
        );


    if (overlay) {

        overlay.remove();

    }

}


// ======================================================
// TOMBOL TAMBAH ANGGARAN
// ======================================================

// ======================================================
// TOMBOL EDIT ANGGARAN
// ======================================================

// ======================================================
// TOMBOL EDIT ANGGARAN
// ======================================================

function addBudgetButton() {

    // Hapus tombol lama jika ada
    document
        .querySelectorAll(
            ".budget-manage-button"
        )
        .forEach(button => {
            button.remove();
        });


    // Cari heading Pengeluaran
    const headings =
        document.querySelectorAll(
            "h1, h2, h3, h4, div"
        );


    let titleElement = null;


    for (
        const element of headings
    ) {

        const text =
            (
                element.textContent || ""
            ).trim();


        if (
            text === "Pengeluaran"
        ) {

            titleElement =
                element;

            break;

        }

    }


    if (!titleElement) {

        console.warn(
            "Judul Pengeluaran tidak ditemukan."
        );

        return;

    }


    // Cari parent terdekat
    // yang menjadi header section
    let header =
        titleElement.parentElement;


    if (!header) {

        return;

    }


    header.classList.add(
        "expense-section-header"
    );


    // ==============================================
    // BUAT AREA ACTION
    // ==============================================

    let actions =
        header.querySelector(
            ".expense-header-actions"
        );


    if (!actions) {

        actions =
            document.createElement(
                "div"
            );

        actions.className =
            "expense-header-actions";

        header.appendChild(
            actions
        );

    }


    // ==============================================
    // TOMBOL EDIT
    // ==============================================

    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.className =
        "budget-manage-button";


    button.innerHTML = `

        <span class="budget-edit-icon">

            <svg viewBox="0 0 24 24">

                <path
                    d="M4 20h4L19 9
                       l-4-4L4 16v4z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round"
                />

            </svg>

        </span>

        <span>
            Edit Anggaran
        </span>

    `;


    button.onclick =
        function(event) {

            event.preventDefault();

            event.stopPropagation();

            openBudgetSettings();

        };


    actions.appendChild(
        button
    );


    // ==============================================
    // STYLE
    // ==============================================

    if (
        !document.getElementById(
            "expense-header-layout"
        )
    ) {

        const style =
            document.createElement(
                "style"
            );


        style.id =
            "expense-header-layout";


        style.textContent = `

            .expense-section-header {

                display:
                    flex !important;

                align-items:
                    center !important;

                justify-content:
                    space-between !important;

                gap:
                    10px !important;

                width:
                    100% !important;

                margin-bottom:
                    12px !important;

            }


            .expense-section-header
            > *:first-child {

                flex:
                    0 0 auto;

            }


            .expense-header-actions {

                display:
                    flex !important;

                align-items:
                    center !important;

                justify-content:
                    flex-end !important;

                gap:
                    10px !important;

                margin-left:
                    auto !important;

            }


            .budget-manage-button {

                display:
                    inline-flex !important;

                align-items:
                    center !important;

                gap:
                    5px !important;

                border:
                    0 !important;

                background:
                    transparent !important;

                color:
                    #005658 !important;

                padding:
                    4px 0 !important;

                margin:
                    0 !important;

                font-size:
                    12px !important;

                font-weight:
                    800 !important;

                white-space:
                    nowrap !important;

                cursor:
                    pointer !important;

            }


            .budget-edit-icon {

                width:
                    15px !important;

                height:
                    15px !important;

                display:
                    inline-flex !important;

            }


            .budget-edit-icon svg {

                width:
                    100% !important;

                height:
                    100% !important;

            }


            @media (max-width: 600px) {

                .expense-section-header {

                    gap:
                        7px !important;

                }


                .expense-header-actions {

                    gap:
                        7px !important;

                }


                .budget-manage-button {

                    font-size:
                        10px !important;

                }

            }

        `;


        document.head.appendChild(
            style
        );

    }

}


// ======================================================
// SETUP EVENT KARTU
// ======================================================

function setupEvents() {

    document
        .querySelectorAll(
            ".expenses .card"
        )
        .forEach(card => {

            card.onclick =
                function() {

                    const name =
                        card.dataset.expense;


                    // ==================================
                    // SEWA RUMAH
                    // ==================================

                    if (
                        name ===
                        "Sewa Rumah"
                    ) {

                        openSewaRumah();

                        return;

                    }


                    // ==================================
                    // LISTRIK
                    // ==================================

                    if (
                        name ===
                        "Listrik"
                    ) {

                        openListrik();

                        return;

                    }

                    if (
                            name ===
                            "Air"
                        ) {

                            openAir();

                            return;

                        }

                        if (
                            name ===
                            "Gas"
                        ) {

                            openGas();

                            return;

                        }

                        // ==================================
// WIFI
// ==================================

if (
    name ===
    "Wifi"
) {

    openWifi();

    return;

}


// ==================================
// NYUCI
// ==================================

if (
    name ===
    "Nyuci"
) {

    openNyuci();

    return;

}


// ==================================
// GALON
// ==================================

if (
    name ===
    "Galon"
) {

    openGalon();

    return;

}


// ==================================
// BENSIN
// ==================================

if (
    name ===
    "Bensin"
) {

    openBensin();

    return;

}

if (name === "Belanja Pasar") {
    openBelanjaPasar();
    return;
}

if (name === "Beras") {
    openBeras();
    return;
}

if (name === "Minyak Manis") {
    openMinyakManis();
    return;
}

if (name === "Jajan/Main/Lainnya") {
    openJajanMainLainnya();
    return;
}

if (name === "Susu & Pempers") {
    openSusuPempers();
    return;
}

if (name === "Gojek Sekolah") {
    openGojekSekolah();
    return;
}

if (name === "Paylater (Jika Ada)") {
    openPaylater();
    return;
}

                    // ==================================
                    // KATEGORI LAIN
                    // ==================================

                    alert(
                        `${name} akan kita buat berikutnya.`
                    );

                };

        });


    addBudgetButton();

}


// ======================================================
// SETUP PROFILE SELECTOR
// ======================================================

function setupProfileSelector() {

    const account =
        document.querySelector(
            ".account-name"
        );


    if (!account) {

        return;

    }


    account.style.cursor =
        "pointer";


    account.onclick =
        function(event) {

            event.stopPropagation();

            openProfileSelector();

        };

}


// ======================================================
// HILANGKAN BOTTOM NAVIGATION
// ======================================================

function removeBottomNavigation() {

    const selectors = [

        ".bottom-nav",

        ".bottom-navigation",

        ".mobile-nav",

        ".navigation-bar",

        ".nav-bottom",

        "nav.bottom",

        ".app-bottom-nav"

    ];


    selectors.forEach(
        selector => {

            document
                .querySelectorAll(
                    selector
                )
                .forEach(element => {

                    element.remove();

                });

        });


    // ==============================================
    // FALLBACK
    // ==============================================

    document
        .querySelectorAll(
            "nav"
        )
        .forEach(nav => {

            const text =
                (
                    nav.textContent ||
                    ""
                ).toLowerCase();


            if (

                text.includes(
                    "beranda"
                ) &&

                (
                    text.includes(
                        "riwayat"
                    ) ||
                    text.includes(
                        "laporan"
                    )
                )

            ) {

                nav.remove();

            }

        });

}


// ======================================================
// STYLE PROFILE SELECTOR
// ======================================================

function addProfileStyles() {

    if (
        document.getElementById(
            "profile-styles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "profile-styles";


    style.textContent = `

        .profile-selector-overlay {

            position: fixed;

            inset: 0;

            z-index: 9998;

            background:
                rgba(15,23,42,.42);

            display: flex;

            align-items: flex-end;

        }


        .profile-selector-sheet {

            width: 100%;
            max-width: 400px;

            margin: 0 auto;

            background: #fff;

            border-radius:
                20px 20px 0 0;

            padding:
                8px 14px
                calc(
                    16px +
                    env(safe-area-inset-bottom)
                );

            box-sizing: border-box;

            box-shadow:
                0 -8px 30px
                rgba(0,0,0,.12);
        }


        .sheet-title {

            text-align: center;

            font-size: 18px;

            font-weight: 800;

            color: #0f172a;

            margin-bottom: 16px;

        }


        .profile-options {

            display: flex;

            flex-direction: column;

            gap: 8px;

        }


        .profile-option {

            width: 100%;

            box-sizing: border-box;

            border:
                1px solid #e2e8f0;

            background: #fff;

            border-radius: 14px;

            padding: 10px;

            display: flex;

            align-items: center;

            gap: 10px;

            text-align: left;

            cursor: pointer;
        }


        .profile-option.active {

            border:
                1px solid #005658;

            background:
                #f1f9f9;

            box-shadow:
                inset 0 0 0 1px #005658,
                0 4px 12px
                rgba(0,86,88,.08);
        }


        .profile-avatar {

            width: 38px;
            height: 38px;

            flex: 0 0 38px;

            border-radius: 50%;

            background: #005658;

            color: #fff;

            display: flex;

            align-items: center;

            justify-content: center;

            font-weight: 800;
        }


        .profile-option-info {

            min-width: 0;

            flex: 1;

        }


        .profile-option-info strong {

            display: block;

            font-size: 14px;

            color: #0f172a;

        }


        .profile-option-info span {

            display: block;

            margin-top: 2px;

            font-size: 12px;

            color: #64748b;

        }


                .profile-check {

            width: 26px;
            height: 26px;

            flex: 0 0 26px;

            display: flex;

            align-items: center;
            justify-content: center;

            border-radius: 50%;

            background: #005658;

            color: #fff;

            font-size: 14px;

            font-weight: 800;

            box-shadow:
                0 2px 6px
                rgba(0,86,88,.16);
        }


       
/* ==========================================
   HEADER PROFIL - RAPI
========================================== */

.account {
    display: flex;
    align-items: center;
    gap: 12px;

    min-width: 0;
    flex: 1;
}

.avatar {
    width: 58px !important;
    height: 58px !important;

    min-width: 58px !important;
    min-height: 58px !important;

    max-width: 58px !important;
    max-height: 58px !important;

    flex: 0 0 58px !important;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 50% !important;

    box-sizing: border-box;

    font-size: 30px;
    font-weight: 700;

    line-height: 1;

    overflow: hidden;
}

.account-info {
    display: flex;
    flex-direction: column;

    justify-content: center;

    min-width: 90px;
}

.account-name {
    display: flex;
    align-items: center;

    gap: 5px;

    height: 27px;

    margin: 0;

    white-space: nowrap;
}

.account-name-text {
    font-size: 21px;

    font-weight: 700;

    line-height: 1;

    color: #0c2b55;
}

.account-name .profile-chevron {

    display: inline-flex;

    align-items: center;
    justify-content: center;

    width: 18px;
    height: 18px;

    margin-left: 2px;

    color: #0c2b55;

    font-size: 22px;

    font-weight: 500;

    line-height: 14px;

    transform: translateY(-1px);
}

.account-name .profile-chevron svg path {
    stroke: #0c2b55 !important;

    stroke-width: 2.4 !important;

    fill: none !important;
}

.bank-name {
    margin-top: 6px;

    font-size: 18px;

    font-weight: 400;

    line-height: 1;

    color: #0c2b55;
}


/* ==========================================
   MONTH SELECTOR
========================================== */

.month-selector {
    width: 285px !important;
    min-width: 285px !important;
    height: 70px !important;

    box-sizing: border-box;

    padding: 0 14px !important;

    display: flex;

    align-items: center;

    gap: 9px;

    flex-shrink: 0;

    border-radius: 18px;

    background: #ffffff;

    color: #0c2b55;

    box-shadow:
        0 6px 18px
        rgba(30,70,100,.07);
}

.month-selector .calendar {
    width: 23px;
    height: 23px;

    flex: 0 0 23px;
}

.month-selector > span:not(.month-arrow) {
    font-size: 16px;

    font-weight: 700;

    white-space: nowrap;
}

.month-arrow {
    width: 32px !important;
    height: 32px !important;

    flex: 0 0 32px !important;

    margin-left: auto !important;
}


        /* ==========================================
        HEADER MOBILE
        ========================================== */

        @media (max-width: 600px) {

            .account {
                gap: 10px;
            }

            .avatar {
                width: 56px !important;
                height: 56px !important;

                min-width: 56px !important;
                min-height: 56px !important;

                max-width: 56px !important;
                max-height: 56px !important;

                flex-basis: 56px !important;

                font-size: 28px;
            }

            .account-info {
                min-width: 82px;
            }

            .account-name-text {
                font-size: 20px;
            }

            .bank-name {
                font-size: 17px;
            }

            .month-selector {
                width: 250px !important;
                min-width: 250px !important;
                height: 64px !important;
            }

            .month-selector > span:not(.month-arrow) {
                font-size: 15px;
            }

        }

        @media (max-width: 430px) {

    .top-row {

        display: grid !important;

        grid-template-columns:
            minmax(0, 1fr)
            190px !important;

        gap: 10px !important;

        align-items: center !important;

    }


    .account {

        min-width: 0 !important;

        width: 100% !important;

        gap: 9px !important;

    }


    .account-info {

        min-width: 0 !important;

        overflow: hidden !important;

    }


    .avatar {

        width: 54px !important;
        height: 54px !important;

        min-width: 54px !important;
        min-height: 54px !important;

        max-width: 54px !important;
        max-height: 54px !important;

        flex-basis: 54px !important;

    }


    .account-name-text {

        font-size: 20px !important;

        white-space: nowrap !important;

    }


    .bank-name {

        font-size: 16px !important;

    }


    .month-selector {

        width: 190px !important;

        min-width: 190px !important;

        max-width: 190px !important;

        height: 58px !important;

        flex: none !important;

        box-sizing: border-box !important;

    }

}

    `;


    document.head.appendChild(
        style
    );

}


// ======================================================
// STYLE DETAIL SEWA RUMAH
// ======================================================

function addDetailStyles() {

    if (
        document.getElementById(
            "detail-styles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "detail-styles";


    style.textContent = `

        .detail-overlay {

            position: fixed;

            inset: 0;

            z-index: 9997;

            background:
                rgba(15,23,42,.42);

            display: flex;

            align-items: flex-end;

        }


        .detail-sheet {

            width: 100%;

            max-width: 560px;

            margin: 0 auto;

            background: #fff;

            border-radius:
                24px 24px 0 0;

            padding:
                10px 18px
                calc(
                    22px +
                    env(
                        safe-area-inset-bottom
                    )
                );

            box-sizing: border-box;

            box-shadow:
                0 -10px 40px
                rgba(0,0,0,.14);

        }


        .detail-header {

            display: flex;

            align-items: flex-start;

            justify-content: space-between;

            gap: 12px;

            margin-bottom: 18px;

        }


        .detail-title {

            font-size: 22px;

            font-weight: 800;

            color: #0f172a;

        }


        .detail-subtitle {

            margin-top: 4px;

            color: #64748b;

            font-size: 13px;

        }


        .detail-close {

            width: 36px;

            height: 36px;

            border: 0;

            border-radius: 50%;

            background: #f1f5f9;

            color: #334155;

            font-size: 24px;

            cursor: pointer;

        }


        .detail-summary {

            display: grid;

            grid-template-columns:
                repeat(3, minmax(0,1fr));

            gap: 8px;

        }


        .detail-summary-item {

            background: #f8fafc;

            border-radius: 14px;

            padding: 12px 10px;

            min-width: 0;

        }


        .detail-summary-item span {

            display: block;

            font-size: 11px;

            color: #64748b;

            margin-bottom: 5px;

        }


        .detail-summary-item strong {

            display: block;

            font-size: 13px;

            color: #0f172a;

            overflow-wrap: anywhere;

        }


        .detail-progress {

            height: 8px;

            background: #e2e8f0;

            border-radius: 99px;

            overflow: hidden;

            margin:
                14px 0 20px;

        }


        .detail-progress span {

            display: block;

            height: 100%;

            background: #005658;

            border-radius: inherit;

        }


        .primary-action {

            width: 100%;

            min-height: 50px;

            border: 0;

            border-radius: 14px;

            background: #005658;

            color: #fff;

            font-size: 14px;

            font-weight: 800;

            cursor: pointer;

        }


        .secondary-action {

            width: 100%;

            min-height: 48px;

            border-radius: 14px;

            font-size: 14px;

            font-weight: 800;

            cursor: pointer;

        }


        .danger-action {

            margin-top: 10px;

            border:
                1px solid #fecdd3;

            background: #fff1f2;

            color: #be123c;

        }


        .paid-status {

            display: flex;

            align-items: center;

            gap: 12px;

            padding: 14px;

            border-radius: 16px;

            background: #ecfdf5;

            color: #166534;

        }


        .paid-icon {

            width: 38px;

            height: 38px;

            border-radius: 50%;

            background: #22c55e;

            color: #fff;

            display: flex;

            align-items: center;

            justify-content: center;

            font-weight: 900;

        }


        .paid-status strong {

            display: block;

            font-size: 14px;

        }


        .paid-status span {

            display: block;

            margin-top: 3px;

            font-size: 11px;

            color: #15803d;

        }


        .detail-note {

            margin-top: 14px;

            color: #64748b;

            font-size: 12px;

            line-height: 1.5;

            text-align: center;

        }

                /* ==========================================
           DETAIL AIR - CLEAN
        ========================================== */

        .air-detail-sheet {
            padding: 14px 18px
                calc(
                    24px +
                    env(safe-area-inset-bottom)
                ) !important;

            border-radius:
                26px 26px 0 0 !important;
        }

        .air-detail-sheet .detail-header {
            margin-bottom: 14px !important;
        }

        .air-detail-sheet .detail-title {
            font-size: 23px !important;
            font-weight: 800 !important;
            color: #005658 !important;
        }

        .air-detail-sheet .detail-subtitle {
            color: #718292 !important;
            font-size: 13px !important;
        }

        .air-detail-sheet .detail-close {
            width: 38px !important;
            height: 38px !important;
            background: #f1f5f6 !important;
            color: #40515c !important;
            font-size: 23px !important;
        }

        .air-detail-sheet .detail-status {
            margin-bottom: 14px !important;
        }

        .air-detail-sheet .status-unpaid {
            display: inline-flex !important;
            padding: 7px 12px !important;
            border-radius: 999px !important;
            background: #fff5dc !important;
            color: #9a6800 !important;
            font-size: 12px !important;
            font-weight: 700 !important;
        }

        .air-detail-sheet .status-paid {
            display: inline-flex !important;
            padding: 7px 12px !important;
            border-radius: 999px !important;
            background: #e8f7ef !important;
            color: #23804b !important;
            font-size: 12px !important;
            font-weight: 700 !important;
        }

        .air-detail-sheet .detail-summary {
            gap: 8px !important;
            margin-bottom: 16px !important;
        }

        .air-detail-sheet .summary-box {
            padding: 11px 9px !important;
            border-radius: 14px !important;
            background: #f6f9fa !important;
            border: 1px solid #e5edef !important;
        }

        .air-detail-sheet .summary-box span {
            font-size: 10px !important;
            color: #718292 !important;
        }

        .air-detail-sheet .summary-box strong {
            font-size: 13px !important;
            color: #173f5f !important;
        }

        .air-detail-sheet .detail-section {
            padding: 13px 15px !important;
            margin-bottom: 15px !important;
            border-radius: 15px !important;
            background: #f7fafb !important;
        }

        .air-detail-sheet .detail-section h3 {
            margin-bottom: 8px !important;
            font-size: 14px !important;
            color: #005658 !important;
        }

        .air-detail-sheet .detail-row {
            padding: 8px 0 !important;
        }

        .air-detail-sheet .detail-row span {
            font-size: 12px !important;
            color: #718292 !important;
        }

        .air-detail-sheet .detail-row strong {
            font-size: 12px !important;
            color: #173f5f !important;
        }

        .air-detail-sheet .pay-button {
            width: 100% !important;
            min-height: 48px !important;
            border: none !important;
            border-radius: 14px !important;
            background: #005658 !important;
            color: #ffffff !important;
            font-size: 14px !important;
            font-weight: 800 !important;
            box-shadow:
                0 5px 14px
                rgba(0,86,88,.16) !important;
        }

        .air-detail-sheet .detail-note {
            margin-top: 12px !important;
            padding: 10px 12px !important;
            border-radius: 11px !important;
            background: #f3f7f8 !important;
            color: #718292 !important;
            font-size: 11px !important;
            line-height: 1.45 !important;
            text-align: center !important;
        }

    `;


    document.head.appendChild(
        style
    );

    

}


// ======================================================
// STYLE PENGATURAN ANGGARAN
// ======================================================

function addBudgetSettingsStyles() {

    if (
        document.getElementById(
            "budget-settings-styles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "budget-settings-styles";


    style.textContent = `

        .budget-settings-overlay {

            position: fixed;

            inset: 0;

            z-index: 9996;

            background:
                rgba(15,23,42,.42);

            display: flex;

            align-items: flex-end;

        }


        .budget-settings-sheet {

            width: 100%;

            max-width: 560px;

            margin: 0 auto;

            max-height: 92vh;

            overflow-y: auto;

            background: #fff;

            border-radius:
                24px 24px 0 0;

            padding:
                10px 18px
                calc(
                    22px +
                    env(
                        safe-area-inset-bottom
                    )
                );

            box-sizing: border-box;

            box-shadow:
                0 -10px 40px
                rgba(0,0,0,.14);

        }


        .budget-settings-header {

            display: flex;

            align-items: flex-start;

            justify-content: space-between;

            gap: 12px;

            margin-bottom: 16px;

        }


        .budget-settings-title {

            font-size: 21px;

            font-weight: 800;

            color: #0f172a;

        }


        .budget-settings-subtitle {

            margin-top: 4px;

            color: #64748b;

            font-size: 12px;

        }


        .budget-settings-close {

            width: 36px;

            height: 36px;

            border: 0;

            border-radius: 50%;

            background: #f1f5f9;

            color: #334155;

            font-size: 24px;

            cursor: pointer;

        }


        .budget-preview {

            padding: 14px;

            border-radius: 15px;

            background: #eef8f7;

            color: #005658;

            font-size: 13px;

            margin-bottom: 14px;

        }


        .budget-preview strong {

            display: block;

            margin-top: 4px;

            font-size: 20px;

        }


        .budget-settings-list {

            display: flex;

            flex-direction: column;

            gap: 9px;

        }


        .budget-setting-row {

            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 12px;

            padding: 12px;

            border: 1px solid #e5e7eb;

            border-radius: 14px;

        }


        .budget-setting-info {

            min-width: 0;

            flex: 1;

        }


        .budget-setting-info strong {

            display: block;

            color: #0f172a;

            font-size: 13px;

            overflow-wrap: anywhere;

        }


        .budget-setting-info span {

            display: block;

            margin-top: 3px;

            color: #64748b;

            font-size: 10px;

        }


        .budget-input {

            width: 130px;

            min-width: 0;

            height: 42px;

            border:
                1px solid #cbd5e1;

            border-radius: 10px;

            padding:
                0 10px;

            box-sizing: border-box;

            font-size: 13px;

            font-weight: 700;

            color: #0f172a;

            outline: none;

        }


        .budget-input:focus {

            border-color: #005658;

            box-shadow:
                0 0 0 3px
                rgba(0,86,88,.10);

        }


        .budget-save-button {

            width: 100%;

            min-height: 50px;

            border: 0;

            border-radius: 14px;

            background: #005658;

            color: #fff;

            font-size: 14px;

            font-weight: 800;

            cursor: pointer;

            margin-top: 16px;

        }


        .budget-settings-note {

            margin-top: 10px;

            color: #64748b;

            font-size: 11px;

            line-height: 1.5;

            text-align: center;

        }


        .budget-manage-button {

            border: 1px solid #d7e4e4;

            background: #fff;

            color: #005658;

            border-radius: 10px;

            padding: 8px 11px;

            font-size: 11px;

            font-weight: 800;

            cursor: pointer;

        }


        @media (max-width: 420px) {

            .budget-setting-row {

                align-items: flex-start;

                flex-direction: column;

            }


            .budget-input {

                width: 100%;

            }

        }

    `;


    document.head.appendChild(
        style
    );

}

// ======================================================
// FINAL COMPACT EXPENSE CARD
// ======================================================

(function() {

    const style = document.createElement("style");

    style.id = "final-compact-expense-card";

    style.textContent = `

        /* GRID KARTU */
        .expenses {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
            align-items: start !important;
        }


        /* KARTU */
        .expenses .card {
            height: auto !important;
            min-height: 0 !important;
            padding: 12px !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            align-self: start !important;
        }


        /* BAGIAN ATAS */
        .expenses .card-top {
            grid-template-columns:
                42px minmax(0, 1fr) 14px !important;

            gap: 8px !important;
        }


        /* ICON */
        .expenses .icon {
            width: 42px !important;
            height: 42px !important;
            min-width: 42px !important;
            border-radius: 13px !important;
        }

        .expenses .icon svg {
            width: 21px !important;
            height: 21px !important;
        }


        /* NAMA */
        .expenses .card-name {
            font-size: 13px !important;
            line-height: 1.15 !important;
        }


        /* NOMINAL */
        .expenses .card-amount {
            margin-top: 3px !important;
            font-size: 12px !important;
            line-height: 1.15 !important;
        }


        /* PANAH */
        .expenses .chevron {
            font-size: 22px !important;
            line-height: 1 !important;
        }


        /* PROGRESS */
        .expenses .card-progress {
            height: 6px !important;
            margin-top: 9px !important;
        }


        /* SISA */
        .expenses .card-remaining {
            margin-top: 6px !important;
            font-size: 10px !important;
            line-height: 1.15 !important;
        }


        /* HP */
        @media (max-width: 600px) {

            .expenses {
                gap: 10px !important;
                align-items: start !important;
            }

            .expenses .card {
                height: auto !important;
                min-height: 0 !important;
                padding: 12px !important;
            }

        }

    `;

    document.head.appendChild(style);

})();

// ======================================================
// INISIALISASI APLIKASI
// ======================================================

// Sembunyikan tombol Lihat Semua tanpa mengubah struktur layout
(function() {
    const style = document.createElement("style");

    style.textContent = `
        .view-all {
            display: none !important;
        }
    `;

    document.head.appendChild(style);
})();

// ======================================================
// STATUS LISTRIK MELEBIHI TARGET
// ======================================================

(function() {

    const style =
        document.createElement("style");

    style.textContent = `

        .electricity-over-budget {
            color: #e55353 !important;
            font-weight: 700 !important;
        }

    `;

    document.head.appendChild(style);

})();

function initializeApp() {

    // ==============================================
    // LOAD DATA
    // ==============================================

    loadProfiles();


    // ==============================================
    // STYLE SELECTOR BULAN
    // ==============================================

    addMonthSelectorStyles();


    // ==============================================
    // HEADER PROFIL
    // ==============================================

    updateProfileHeader();


    // ==============================================
    // RENDER KARTU
    // ==============================================

    renderExpenseCards();


    // ==============================================
    // DASHBOARD
    // ==============================================

    updateDashboard();


    // ==============================================
    // EVENT PROFILE
    // ==============================================

    setupProfileSelector();


    // ==============================================
    // EVENT KARTU
    // ==============================================

    setupEvents();


    // ==============================================
    // STYLE
    // ==============================================

   addProfileStyles();

    addDetailStyles();

    addElectricityStyles();

    addBudgetSettingsStyles();

    addNewAppDesign();

    removeBottomNavigation();


    // ==============================================
    // HAPUS NAVIGASI BAWAH
    // ==============================================

    removeBottomNavigation();

}


// ======================================================
// JALANKAN SAAT DOM SELESAI
// ======================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApp
    );

} else {

    initializeApp();

}


// ======================================================
// EXPORT GLOBAL
// Agar onclick HTML dapat mengakses fungsi
// ======================================================

window.openProfileSelector =
    openProfileSelector;

window.switchProfile =
    switchProfile;

window.switchMonth =
    switchMonth;



window.openMonthSelector = openMonthSelector;

window.closeMonthSelector =
    closeMonthSelector;

window.closeProfileSelector =
    closeProfileSelector;

window.openSewaRumah =
    openSewaRumah;

window.paySewaRumah =
    paySewaRumah;

window.cancelSewaPayment =
    cancelSewaPayment;

window.closeDetail =
    closeDetail;

window.openListrik =
    openListrik;

window.openAir =
    openAir;

window.payAir =
    payAir;

window.cancelAirPayment =
    cancelAirPayment;

window.openGas = openGas;
window.payGas = payGas;
window.cancelGasPayment = cancelGasPayment;

window.openWifi =
    openWifi;

window.payWifi =
    payWifi;

window.cancelWifiPayment =
    cancelWifiPayment;


window.openNyuci =
    openNyuci;

window.openGalon =
    openGalon;

window.openBensin =
    openBensin;

window.openBelanjaPasar =
    openBelanjaPasar;

window.openBeras =
    openBeras;

window.openMinyakManis =
    openMinyakManis;

    window.openJajanMainLainnya =
    openJajanMainLainnya;

window.openSusuPempers =
    openSusuPempers;

window.openGojekSekolah =
    openGojekSekolah;

window.openPaylater =
    openPaylater;

window.addCustomRepeatingExpenseWithNote =
    addCustomRepeatingExpenseWithNote;

window.addRepeatingExpense =
    addRepeatingExpense;

window.addCustomRepeatingExpense =
    addCustomRepeatingExpense;

window.deleteRepeatingExpense =
    deleteRepeatingExpense;

window.closeRepeatingExpense =
    closeRepeatingExpense;

window.addElectricityExpense =
    addElectricityExpense;

window.openCustomElectricity =
    openCustomElectricity;

window.deleteElectricityTransaction =
    deleteElectricityTransaction;

window.closeListrik =
    closeListrik;

window.openBudgetSettings =
    openBudgetSettings;

window.updateBudgetPreview =
    updateBudgetPreview;

window.saveBudgetSettings =
    saveBudgetSettings;

window.closeBudgetSettings =
    closeBudgetSettings;

    // ======================================================
// ALTUS – BRI
// FINAL SAFETY CHECK
// ======================================================

// Pastikan semua fungsi utama tersedia secara global
// sehingga tombol onclick dari HTML tetap dapat bekerja.

window.rupiah =
    rupiah;

window.getToday =
    getToday;

window.getCurrentProfile =
    getCurrentProfile;

window.getCurrentExpenses =
    getCurrentExpenses;

window.getBudgetTotal =
    getBudgetTotal;

window.getTotalSpent =
    getTotalSpent;

window.updateDashboard =
    updateDashboard;

window.updateExpenseCards =
    updateExpenseCards;

window.renderExpenseCards =
    renderExpenseCards;


// ======================================================
// REFRESH MANUAL
// ======================================================

window.refreshBudgetApp =
    function() {

        loadProfiles();

        updateProfileHeader();

        renderExpenseCards();

        updateDashboard();

        setupProfileSelector();

        setupEvents();

        removeBottomNavigation();

    };


// ======================================================
// PERBAIKAN OTOMATIS DATA LISTRIK
// ======================================================

function normalizeElectricityData() {

    Object.keys(profiles)
        .forEach(profileKey => {

            const profile =
                profiles[profileKey];


            if (!profile) {

                return;

            }


            if (!profile.expenses) {

                profile.expenses = {};

            }


            if (
                profile.expenses["Listrik"]
            ) {

                const listrik =
                    profile.expenses[
                        "Listrik"
                    ];


                if (
                    !Array.isArray(
                        listrik.history
                    )
                ) {

                    listrik.history = [];

                }


                if (
                    typeof listrik.budget !==
                    "number"
                ) {

                    listrik.budget =
                        Number(
                            listrik.budget || 0
                        );

                }


                if (
                    typeof listrik.spent !==
                    "number"
                ) {

                    listrik.spent =
                        Number(
                            listrik.spent || 0
                        );

                }

            }

        });


    saveProfiles();

}


// ======================================================
// JALANKAN NORMALISASI
// ======================================================

try {

    normalizeElectricityData();

} catch (error) {

    console.error(
        "Normalisasi data gagal:",
        error
    );

}


// ======================================================
// SELESAI
// ======================================================

// File app.js selesai.
//
// Fitur utama:
// 1. Multi profil ALTUS BRI
// 2. BELLA BRI
// 3. BELLA BSI
// 4. Anggaran per kategori
// 5. Edit anggaran
// 6. Sewa Rumah - tandai sudah dibayar
// 7. Sewa Rumah - batalkan pembayaran
// 8. Listrik - tambah token
// 9. Listrik - Rp50.000
// 10. Listrik - Rp100.000
// 11. Listrik - Rp150.000
// 12. Listrik - nominal lain
// 13. Listrik - riwayat transaksi
// 14. Listrik - hapus transaksi satu per satu
// 15. Penghapusan otomatis mengembalikan nominal
// 16. Dashboard otomatis diperbarui
// 17. Data tersimpan di localStorage
// 18. Navigasi bawah dihilangkan
// 19. Profil dapat diganti dari header
// 20. Data setiap profil berdiri sendiri
//
// ======================================================

// ======================================================
// MOBILE POPUP OPTIMIZATION
// ======================================================

(function addMobilePopupOptimization() {

    if (
        document.getElementById(
            "mobile-popup-optimization"
        )
    ) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "mobile-popup-optimization";

    style.textContent = `

        /* ==========================================
           POPUP / BOTTOM SHEET
        ========================================== */

        .detail-overlay,
        .electricity-overlay,
        .profile-selector-overlay,
        .budget-settings-overlay {

            align-items: flex-end;

            padding: 0 8px;

            box-sizing: border-box;

        }


        .detail-sheet,
        .electricity-sheet,
        .profile-selector-sheet,
        .budget-settings-sheet {

            width: 100%;

            max-width: 100%;

            margin: 0 auto;

            border-radius:
                20px 20px 0 0;

            padding:
                8px 14px
                calc(
                    14px +
                    env(safe-area-inset-bottom)
                );

            box-sizing: border-box;

        }


        /* ==========================================
           BATASI TINGGI POPUP
        ========================================== */

        .detail-sheet {

            max-height: 72vh;

            overflow-y: auto;

        }


        .electricity-sheet {

            max-height: 82vh;

            overflow-y: auto;

        }


        .profile-selector-sheet {

            max-height: 70vh;

            overflow-y: auto;

        }


        .budget-settings-sheet {

            max-height: 82vh;

            overflow-y: auto;

        }


        /* ==========================================
           HANDLE
        ========================================== */

        .detail-sheet .sheet-handle,
        .electricity-sheet .sheet-handle,
        .profile-selector-sheet .sheet-handle,
        .budget-settings-sheet .sheet-handle {

            width: 36px;

            height: 4px;

            margin:
                3px auto
                13px;

        }


        /* ==========================================
           JUDUL
        ========================================== */

        .detail-title,
        .electricity-title,
        .budget-settings-title {

            font-size: 19px;

        }


        .electricity-subtitle,
        .detail-subtitle,
        .budget-settings-subtitle {

            font-size: 12px;

        }


        /* ==========================================
           RINGKASAN
        ========================================== */

        .detail-summary,
        .electricity-summary {

            gap: 6px;

        }


        .detail-summary-item,
        .electricity-summary-item {

            padding:
                9px 8px;

            border-radius: 11px;

        }


        .detail-summary-item span,
        .electricity-summary-item span {

            font-size: 10px;

            margin-bottom: 3px;

        }


        .detail-summary-item strong,
        .electricity-summary-item strong {

            font-size: 11px;

        }


        /* ==========================================
           PROGRESS
        ========================================== */

        .detail-progress,
        .electricity-progress {

            height: 6px;

            margin:
                10px 0 15px;

        }


        /* ==========================================
           TOMBOL LISTRIK
        ========================================== */

        .electricity-section-title {

            font-size: 13px;

            margin:
                13px 0 8px;

        }


        .electricity-buttons {

            gap: 7px;

        }


        .electricity-buttons button {

            min-height: 42px;

            border-radius: 11px;

            font-size: 12px;

        }


        /* ==========================================
           RIWAYAT LISTRIK
        ========================================== */

        .electricity-history {

            gap: 6px;

        }


        .electricity-history-item {

            padding: 9px;

            border-radius: 11px;

            gap: 8px;

        }


        .electricity-history-main strong {

            font-size: 12px;

        }


        .electricity-history-main span {

            font-size: 10px;

        }


        .electricity-history-label {

            font-size: 9px !important;

            padding:
                4px 6px;

        }


        .electricity-delete-button {

            padding:
                6px 8px;

            font-size: 10px;

            border-radius: 8px;

        }


        /* ==========================================
           SEWA RUMAH
        ========================================== */

        .primary-action {

            min-height: 44px;

            border-radius: 11px;

            font-size: 13px;

        }


        .secondary-action {

            min-height: 42px;

            border-radius: 11px;

            font-size: 12px;

        }


        .paid-status {

            padding: 10px;

            border-radius: 12px;

        }


        .paid-icon {

            width: 32px;

            height: 32px;

            flex: 0 0 32px;

        }


        .detail-note {

            margin-top: 10px;

            font-size: 10px;

        }


        /* ==========================================
           PROFILE
        ========================================== */

        .sheet-title {

            font-size: 16px;

            margin-bottom: 11px;

        }


        .profile-options {

            gap: 6px;

        }


        .profile-option {

            padding: 9px;

            border-radius: 12px;

        }


        .profile-avatar {

            width: 36px;

            height: 36px;

            flex-basis: 36px;

        }


        /* ==========================================
           PENGATURAN ANGGARAN
        ========================================== */

        .budget-preview {

            padding: 10px;

            border-radius: 12px;

            font-size: 11px;

        }


        .budget-preview strong {

            font-size: 17px;

        }


        .budget-settings-list {

            gap: 6px;

        }


        .budget-setting-row {

            padding: 9px;

            border-radius: 11px;

        }


        .budget-setting-info strong {

            font-size: 12px;

        }


        .budget-setting-info span {

            font-size: 9px;

        }


        .budget-input {

            height: 38px;

            font-size: 12px;

            border-radius: 9px;

        }


        .budget-save-button {

            min-height: 44px;

            border-radius: 11px;

            font-size: 13px;

            margin-top: 12px;

        }


        .budget-settings-note {

            font-size: 9px;

        }


        /* ==========================================
           HP KECIL
        ========================================== */

        @media (max-width: 390px) {

            .detail-overlay,
            .electricity-overlay,
            .profile-selector-overlay,
            .budget-settings-overlay {

                padding:
                    0 5px;

            }


            .detail-sheet,
            .electricity-sheet,
            .profile-selector-sheet,
            .budget-settings-sheet {

                border-radius:
                    18px 18px 0 0;

                padding:
                    7px 11px
                    calc(
                        12px +
                        env(
                            safe-area-inset-bottom
                        )
                    );

            }


            .electricity-sheet {

                max-height: 84vh;

            }


            .detail-sheet {

                max-height: 68vh;

            }

        }

    `;

    document.head.appendChild(style);

})();

// ======================================================
// POPUP RESPONSIVE - MOBILE STYLE
// Desktop tetap seperti layar HP
// ======================================================

(function() {

    const oldStyle =
        document.getElementById(
            "final-mobile-popup-fix"
        );

    if (oldStyle) {
        oldStyle.remove();
    }


    const style =
        document.createElement("style");

    style.id =
        "responsive-popup-final";


    style.textContent = `

        /* ==================================================
           OVERLAY
        ================================================== */

        .detail-overlay,
        .electricity-overlay,
        .profile-selector-overlay,
        .budget-settings-overlay {

            position: fixed !important;

            inset: 0 !important;

            width: 100% !important;

            height: 100% !important;

            padding: 0 !important;

            margin: 0 !important;

            display: flex !important;

            align-items: flex-end !important;

            justify-content: center !important;

            box-sizing: border-box !important;

        }


        /* ==================================================
           POPUP DEFAULT
           Desktop dibuat seperti layar mobile
        ================================================== */

        .detail-sheet,
        .electricity-sheet,
        .profile-selector-sheet,
        .budget-settings-sheet {

            width: 100% !important;

            max-width: 440px !important;

            min-width: 0 !important;

            margin: 0 auto !important;

            box-sizing: border-box !important;

            border-radius:
                22px 22px 0 0 !important;

        }


        /* ==================================================
           SEWA RUMAH
        ================================================== */

        .detail-sheet {

            max-height: 72vh !important;

            overflow-y: auto !important;

            padding:
                8px 14px
                calc(
                    16px +
                    env(safe-area-inset-bottom)
                ) !important;

        }


        /* ==================================================
           LISTRIK
        ================================================== */

        .electricity-sheet {

            max-height: 82vh !important;

            overflow-y: auto !important;

            padding:
                8px 14px
                calc(
                    16px +
                    env(safe-area-inset-bottom)
                ) !important;

        }


        /* ==================================================
           PROFILE
        ================================================== */

        .profile-selector-sheet {

            max-height: 70vh !important;

            overflow-y: auto !important;

            padding:
                8px 14px
                calc(
                    16px +
                    env(safe-area-inset-bottom)
                ) !important;

        }


        /* ==================================================
           PENGATURAN ANGGARAN
        ================================================== */

        .budget-settings-sheet {

            max-height: 82vh !important;

            overflow-y: auto !important;

            padding:
                8px 14px
                calc(
                    16px +
                    env(safe-area-inset-bottom)
                ) !important;

        }


        /* ==================================================
           HANDLE
        ================================================== */

        .detail-sheet .sheet-handle,
        .electricity-sheet .sheet-handle,
        .profile-selector-sheet .sheet-handle,
        .budget-settings-sheet .sheet-handle {

            width: 38px !important;

            height: 4px !important;

            margin:
                3px auto 14px !important;

        }


        /* ==================================================
           MOBILE
        ================================================== */

        @media (max-width: 600px) {

            .detail-sheet,
            .electricity-sheet,
            .profile-selector-sheet,
            .budget-settings-sheet {

                width:
                    calc(100% - 10px) !important;

                max-width: none !important;

            }

        }


        /* ==================================================
           HP SANGAT KECIL
        ================================================== */

        @media (max-width: 390px) {

            .detail-sheet,
            .electricity-sheet,
            .profile-selector-sheet,
            .budget-settings-sheet {

                width:
                    calc(100% - 6px) !important;

                border-radius:
                    18px 18px 0 0 !important;

            }

        }


        /* ==================================================
           DETAIL SEWA
        ================================================== */

        .detail-header {

            margin-bottom:
                12px !important;

        }


        .detail-title {

            font-size:
                20px !important;

        }


        .detail-subtitle {

            font-size:
                12px !important;

        }


        .detail-summary,
        .electricity-summary {

            gap:
                6px !important;

        }


        .detail-summary-item,
        .electricity-summary-item {

            padding:
                9px 8px !important;

            border-radius:
                11px !important;

        }


        .detail-summary-item span,
        .electricity-summary-item span {

            font-size:
                10px !important;

        }


        .detail-summary-item strong,
        .electricity-summary-item strong {

            font-size:
                12px !important;

        }


        /* ==================================================
           PROGRESS
        ================================================== */

        .detail-progress,
        .electricity-progress {

            height:
                6px !important;

            margin:
                10px 0 15px !important;

        }


        /* ==================================================
           TOMBOL
        ================================================== */

        .primary-action {

            min-height:
                46px !important;

            border-radius:
                12px !important;

            font-size:
                13px !important;

        }


        .secondary-action {

            min-height:
                44px !important;

            border-radius:
                12px !important;

            font-size:
                12px !important;

        }


        /* ==================================================
           LISTRIK
        ================================================== */

        .electricity-section-title {

            font-size:
                13px !important;

            margin:
                13px 0 8px !important;

        }


        .electricity-buttons {

            gap:
                7px !important;

        }


        .electricity-buttons button {

            min-height:
                42px !important;

            border-radius:
                11px !important;

            font-size:
                12px !important;

        }


        .electricity-history {

            gap:
                6px !important;

        }


        .electricity-history-item {

            padding:
                9px !important;

            border-radius:
                11px !important;

        }


        .electricity-history-main strong {

            font-size:
                12px !important;

        }


        .electricity-history-main span {

            font-size:
                10px !important;

        }


        .electricity-delete-button {

            padding:
                6px 8px !important;

            font-size:
                10px !important;

        }

    `;


    document.head.appendChild(
        style
    );

})();

// ======================================================
// MODERN EXPENSE CARD DESIGN
// ======================================================

(function() {

    const old =
        document.getElementById(
            "modern-expense-card-style"
        );

    if (old) {
        old.remove();
    }


    const style =
        document.createElement("style");

    style.id =
        "modern-expense-card-style";


    style.textContent = `

        /* ==========================================
           AREA PENGELUARAN
        ========================================== */

        .expenses {

            gap: 12px !important;

        }


        /* ==========================================
           CARD
        ========================================== */

        .expenses .card {

            position: relative !important;

            background: #ffffff !important;

            border:
                1px solid #e3edf0 !important;

            border-radius:
                20px !important;

            padding:
                15px !important;

            min-width: 0 !important;

            overflow: hidden !important;

            box-shadow:
                0 5px 16px
                rgba(0, 70, 72, .055) !important;

            transition:
                transform .18s ease,
                box-shadow .18s ease,
                border-color .18s ease !important;

        }


        .expenses .card:active {

            transform:
                scale(.985) !important;

        }


        /* ==========================================
           BAGIAN ATAS CARD
        ========================================== */

        .expenses .card-top {

            display: grid !important;

            grid-template-columns:
                54px minmax(0,1fr) 20px !important;

            align-items: center !important;

            gap: 12px !important;

            min-width: 0 !important;

        }


        /* ==========================================
           ICON BULAT
        ========================================== */

        .expenses .icon {

            width: 54px !important;

            height: 54px !important;

            min-width: 54px !important;

            border-radius: 18px !important;

            display: flex !important;

            align-items: center !important;

            justify-content: center !important;

            box-sizing: border-box !important;

        }


        .expenses .icon svg {

            width: 27px !important;

            height: 27px !important;

            display: block !important;

                color: inherit !important;

        }


        /* ==========================================
           WARNA ICON
        ========================================== */

        .expenses .icon-house {

            background:
                #fff0f1 !important;

            color:
                #dc3545 !important;

        }


        .expenses .icon-electric {

            background:
                #fff6d9 !important;

            color:
                #e5a400 !important;

        }


        .expenses .icon-water {

            background:
                #e7f1ff !important;

            color:
                #1976d2 !important;

        }


        .expenses .icon-gas {

            background:
                #fff0e9 !important;

            color:
                #ef5b25 !important;

        }


        .expenses .icon-wifi {

            background:
                #f0eaff !important;

            color:
                #7048d8 !important;

        }


        .expenses .icon-wash {

            background:
                #ffeaf4 !important;

            color:
                #d63384 !important;

        }


        .expenses .icon-gallon {

            background:
                #e7f7ff !important;

            color:
                #168acb !important;

        }


        .expenses .icon-fuel {

            background:
                #fff0f1 !important;

            color:
                #dc3545 !important;

        }


        .expenses .icon-shopping {

            background:
                #e9f7ed !important;

            color:
                #198754 !important;

        }


        .expenses .icon-rice {

            background:
                #fff8e8 !important;

            color:
                #bd8b00 !important;

        }


        .expenses .icon-oil {

            background:
                #fff1dc !important;

            color:
                #d77b00 !important;

        }


        .expenses .icon-other {

            background:
                #edf2ff !important;

            color:
                #536dfe !important;

        }


        .expenses .icon-school {

            background:
                #e7f7f5 !important;

            color:
                #00897b !important;

        }


        .expenses .icon-baby {

            background:
                #fff0f6 !important;

            color:
                #e83e8c !important;

        }


        .expenses .icon-paylater {

            background:
                #f0f2f5 !important;

            color:
                #475569 !important;

        }


        /* ==========================================
           INFO
        ========================================== */

        .expenses .card-info {

            min-width: 0 !important;

        }


        .expenses .card-name {

            font-size:
                15px !important;

            line-height:
                1.25 !important;

            font-weight:
                800 !important;

            color:
                #102a43 !important;

            white-space:
                normal !important;

            overflow-wrap:
                anywhere !important;

        }


        .expenses .card-amount {

            margin-top:
                5px !important;

            font-size:
                14px !important;

            line-height:
                1.2 !important;

            font-weight:
                500 !important;

            color:
                #173b63 !important;

            white-space:
                nowrap !important;

            overflow:
                hidden !important;

            text-overflow:
                ellipsis !important;

        }


        /* ==========================================
           CHEVRON
        ========================================== */

        .expenses .chevron {

            color:
                #58758c !important;

            font-size:
                30px !important;

            font-weight:
                300 !important;

            line-height:
                1 !important;

            text-align:
                center !important;

        }


        /* ==========================================
           PROGRESS
        ========================================== */

        .expenses .card-progress {

            height:
                7px !important;

            margin-top:
                15px !important;

            background:
                #e7eef2 !important;

            border-radius:
                999px !important;

            overflow:
                hidden !important;

        }


        .expenses .card-progress span {

            display:
                block !important;

            width:
                0%;

            height:
                100% !important;

            border-radius:
                999px !important;

            background:
                #005658 !important;

            transition:
                width .25s ease !important;

        }


        /* ==========================================
           SISA
        ========================================== */

        .expenses .card-remaining {

            margin-top:
                9px !important;

            text-align:
                right !important;

            font-size:
                12px !important;

            line-height:
                1.2 !important;

            color:
                #607d8b !important;

            white-space:
                nowrap !important;

        }


        /* ==========================================
           SUDAH PENUH
        ========================================== */

        .expenses .card.fully-used {

            border-color:
                #ffd6d6 !important;

        }


        .expenses .card.fully-used
        .card-progress span {

            background:
                #dc3545 !important;

        }


        /* ==========================================
           MOBILE
        ========================================== */

        @media (max-width: 600px) {

            .expenses {

                grid-template-columns:
                    repeat(2, minmax(0,1fr))
                    !important;

                gap:
                    10px !important;

            }


            .expenses .card {

                padding:
                    13px !important;

                border-radius:
                    17px !important;

            }


            .expenses .card-top {

                grid-template-columns:
                    42px minmax(0,1fr) 14px !important;

                gap:
                    8px !important;

            }


            .expenses .icon {

                width:
                    42px !important;

                height:
                    42px !important;

                min-width:
                    42px !important;

                border-radius:
                    14px !important;

            }


            .expenses .icon svg {

                width:
                    22px !important;

                height:
                    22px !important;

            }


            .expenses .card-name {

                font-size:
                    13px !important;

            }


            .expenses .card-amount {

                font-size:
                    12px !important;

                margin-top:
                    4px !important;

            }


            .expenses .chevron {

                font-size:
                    25px !important;

            }


            .expenses .card-progress {

                height:
                    6px !important;

                margin-top:
                    12px !important;

            }


            .expenses .card-remaining {

                font-size:
                    10px !important;

                margin-top:
                    7px !important;

            }

        }


        /* ==========================================
           HP KECIL
        ========================================== */

        @media (max-width: 390px) {

            .expenses .card {

                padding:
                    11px !important;

                border-radius:
                    15px !important;

            }


            .expenses .card-top {

                grid-template-columns:
                    38px minmax(0,1fr) 12px !important;

                gap:
                    7px !important;

            }


            .expenses .icon {

                width:
                    38px !important;

                height:
                    38px !important;

                min-width:
                    38px !important;

                border-radius:
                    12px !important;

            }


            .expenses .icon svg {

                width:
                    20px !important;

                height:
                    20px !important;

            }


            .expenses .card-name {

                font-size:
                    12px !important;

            }


            .expenses .card-amount {

                font-size:
                    11px !important;

            }

        }

    `;


    document.head.appendChild(
        style
    );

    // ======================================================
// DESAIN BARU ALTUS – BRI
// OVERRIDE UI LAMA
// ======================================================

function addNewAppDesign() {

    if (
        document.getElementById(
            "altus-new-design"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "altus-new-design";


    style.textContent = `


        /* ==================================================
           HEADER PROFIL
        ================================================== */

        .account {

            display: flex !important;

            align-items: center !important;

            gap: 12px !important;

            min-width: 0 !important;

            flex: 1 !important;

        }


        .avatar {

            width: 58px !important;

            height: 58px !important;

            min-width: 58px !important;

            min-height: 58px !important;

            max-width: 58px !important;

            max-height: 58px !important;

            flex: 0 0 58px !important;

            border-radius: 50% !important;

            box-sizing: border-box !important;

        }


        .account-info {

            min-width: 0 !important;

            display: flex !important;

            flex-direction: column !important;

            justify-content: center !important;

        }


        .account-name {

            display: flex !important;

            align-items: center !important;

            gap: 6px !important;

            height: 28px !important;

            margin: 0 !important;

            white-space: nowrap !important;

            cursor: pointer !important;

        }


        .account-name-text {

            display: block !important;

            font-size: 22px !important;

            font-weight: 750 !important;

            line-height: 1 !important;

        }


        .profile-chevron {

            width: 19px !important;

            height: 19px !important;

            flex: 0 0 19px !important;

            display: inline-flex !important;

            align-items: center !important;

            justify-content: center !important;

            margin: 0 !important;

            padding: 0 !important;

            font-size: 21px !important;

            line-height: 14px !important;

            color: #0d2d4f !important;

            transform:
                translateY(-1px) !important;

        }


        .bank-name {

            margin-top: 7px !important;

            font-size: 17px !important;

            font-weight: 500 !important;

            line-height: 1 !important;

            color: #294b6b !important;

        }


        /* ==================================================
           MONTH
        ================================================== */

        .month-selector {

            height: 64px !important;

            min-width: 238px !important;

            padding:
                0 13px !important;

            border-radius:
                18px !important;

            display: flex !important;

            align-items: center !important;

            gap: 10px !important;

            flex-shrink: 0 !important;

            box-sizing: border-box !important;

            background:
                rgba(255,255,255,.94) !important;

            box-shadow:
                0 8px 24px
                rgba(45,85,120,.08) !important;

        }


        .month-selector > span:not(.month-arrow) {

            font-size: 16px !important;

            font-weight: 700 !important;

            white-space: nowrap !important;

        }


        .month-arrow {

            width: 32px !important;

            height: 32px !important;

            flex: 0 0 32px !important;

            margin-left: auto !important;

            display: flex !important;

            align-items: center !important;

            justify-content: center !important;

            border-radius: 50% !important;

            background: #eff7f7 !important;

            color: #005658 !important;

            font-size: 20px !important;

            line-height: 1 !important;

        }


        /* ==================================================
           BUDGET
        ================================================== */

        .budget-card {

            border-radius: 24px !important;

            padding:
                24px 24px 22px !important;

            box-shadow:
                0 16px 30px
                rgba(31,91,145,.22) !important;

        }


        .budget-title {

            font-size: 15px !important;

            margin-bottom: 9px !important;

        }


        .budget-total {

            font-size: 39px !important;

            line-height: 1.05 !important;

        }


        .budget-progress {

            height: 10px !important;

            margin:
                22px 0 23px !important;

        }


        /* ==================================================
           SUMMARY
        ================================================== */

        .summary {

            grid-template-columns:
                1fr
                1.15fr
                .9fr !important;

            width: 100% !important;

        }


        .summary-item {

            min-width: 0 !important;

        }


        .summary-item:nth-child(1) {

            padding-right:
                14px !important;

        }


        .summary-item:nth-child(2) {

            padding:
                0 14px !important;

        }


        .summary-item:nth-child(3) {

            padding-left:
                14px !important;

        }


        .summary-value {

            font-size: 17px !important;

            line-height: 1.2 !important;

            white-space: nowrap !important;

        }


        .summary-percent {

            font-size: 12px !important;

        }


        .safe {

            min-height: 43px !important;

            padding:
                0 13px !important;

            border-radius: 999px !important;

        }


        /* ==================================================
           PENGELUARAN
        ================================================== */

        .section-header {

            display: flex !important;

            align-items: center !important;

            justify-content: space-between !important;

            gap: 10px !important;

            margin:
                28px 0 14px !important;

        }


        .section-title {

            font-size: 23px !important;

            line-height: 1 !important;

            white-space: nowrap !important;

        }


        .view-all {

            font-size: 14px !important;

            white-space: nowrap !important;

        }


        .expense-section-header {

            width: 100% !important;

            display: flex !important;

            align-items: center !important;

            justify-content: space-between !important;

            gap: 8px !important;

        }


        .expense-header-actions {

            margin-left: auto !important;

            display: flex !important;

            align-items: center !important;

        }


        .budget-manage-button {

            font-size: 12px !important;

            white-space: nowrap !important;

            color: #005658 !important;

        }


        /* ==================================================
           KARTU
        ================================================== */

        .expenses {

            width: 100% !important;

            display: grid !important;

            grid-template-columns:
                repeat(
                    2,
                    minmax(0,1fr)
                ) !important;

            gap: 12px !important;

        }


        .card {

            width: 100% !important;

            min-width: 0 !important;

            min-height: 164px !important;

            padding: 15px !important;

            border-radius: 19px !important;

            overflow: hidden !important;

            box-sizing: border-box !important;

        }


        .card-top {

            width: 100% !important;

            min-width: 0 !important;

            display: flex !important;

            align-items: flex-start !important;

            gap: 10px !important;

        }


        .icon {

            width: 55px !important;

            height: 55px !important;

            min-width: 55px !important;

            flex: 0 0 55px !important;

            border-radius: 17px !important;

        }


        .card-info {

            min-width: 0 !important;

            flex: 1 !important;

        }


        .card-name {

            font-size: 16px !important;

            font-weight: 750 !important;

            line-height: 1.18 !important;

            white-space: normal !important;

            overflow-wrap: anywhere !important;

        }


        .card-amount {

            margin-top: 7px !important;

            font-size: 15px !important;

            white-space: nowrap !important;

        }


        .chevron {

            flex: 0 0 auto !important;

            margin-top: 15px !important;

            font-size: 28px !important;

        }


        .card-progress {

            height: 7px !important;

            margin-top: 15px !important;

        }


        .card-remaining {

            margin-top: 9px !important;

            font-size: 12px !important;

            white-space: nowrap !important;

        }


        /* ==================================================
           MOBILE
        ================================================== */

        @media (max-width: 430px) {

            .top-row {

                gap: 10px !important;

            }


            .avatar {

                width: 54px !important;

                height: 54px !important;

                min-width: 54px !important;

                min-height: 54px !important;

                max-width: 54px !important;

                max-height: 54px !important;

                flex-basis: 54px !important;

            }


            .account {

                gap: 9px !important;

            }


            .account-name-text {

                font-size: 20px !important;

            }


            .bank-name {

                font-size: 16px !important;

            }


            .month-selector {

                width: 190px !important;

                min-width: 190px !important;

                height: 58px !important;

                padding:
                    0 10px !important;

                gap: 7px !important;

            }


            .month-selector > span:not(.month-arrow) {

                font-size: 14px !important;

            }


            .month-arrow {

                width: 29px !important;

                height: 29px !important;

                flex-basis: 29px !important;

            }


            .budget-card {

                padding:
                    21px 20px 20px !important;

                border-radius:
                    21px !important;

            }


            .budget-total {

                font-size: 34px !important;

            }


            .summary-value {

                font-size: 15px !important;

            }


            .summary-percent {

                font-size: 11px !important;

            }


            .safe {

                min-height: 39px !important;

                padding:
                    0 10px !important;

                font-size: 12px !important;

            }


            .section-title {

                font-size: 21px !important;

            }


            .view-all {

                font-size: 13px !important;

            }


            .budget-manage-button {

                font-size: 10px !important;

            }


            .expenses {

                gap: 10px !important;

            }


            .card {

                min-height: 154px !important;

                padding: 12px !important;

                border-radius: 17px !important;

            }


            .card-top {

                gap: 8px !important;

            }


            .icon {

                width: 50px !important;

                height: 50px !important;

                min-width: 50px !important;

                flex-basis: 50px !important;

                border-radius: 15px !important;

            }


            .icon svg {

                width: 27px !important;

                height: 27px !important;

            }


            .card-name {

                font-size: 14px !important;

            }


            .card-amount {

                font-size: 14px !important;

            }


            .chevron {

                font-size: 25px !important;

                margin-top: 12px !important;

            }


            .card-remaining {

                font-size: 11px !important;

            }

        }


        @media (max-width: 360px) {

            .top-row {

                grid-template-columns:
                    minmax(0,1fr)
                    174px !important;

            }


            .month-selector {

                width: 174px !important;

                min-width: 174px !important;

            }


            .month-selector > span:not(.month-arrow) {

                font-size: 13px !important;

            }


            .account-name-text {

                font-size: 19px !important;

            }


            .avatar {

                width: 50px !important;

                height: 50px !important;

                min-width: 50px !important;

                min-height: 50px !important;

                max-width: 50px !important;

                max-height: 50px !important;

                flex-basis: 50px !important;

            }

        }

    `;


    document.head.appendChild(
        style
    );

}
window.addNewAppDesign = addNewAppDesign;
})();