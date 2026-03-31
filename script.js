window.onload = () => {
    /* ============================================================
        1. スライダー制御
       ============================================================ */
    const sliderWrapper = document.getElementById('mainSlider');
    const slider = sliderWrapper ? sliderWrapper.querySelector('.slider-container') : null;
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (slider && slides.length > 0) {
        const totalSlides = slides.length;

        const firstClone = slides[0].cloneNode(true);
        const lastClone = slides[totalSlides - 1].cloneNode(true);
        slider.appendChild(firstClone);
        slider.prepend(lastClone);

        let counter = 1;
        let isTransitioning = false;

        const getSlideWidth = () => sliderWrapper.offsetWidth;

        slider.style.transition = "none";
        slider.style.transform = `translateX(-${getSlideWidth()}px)`;

        function move(dir) {
            if (isTransitioning) return;
            isTransitioning = true;
            counter += dir;
            slider.style.transition = "transform 0.6s ease-in-out";
            slider.style.transform = `translateX(${-getSlideWidth() * counter}px)`;
        }

        slider.addEventListener('transitionend', () => {
            isTransitioning = false;
            if (counter >= totalSlides + 1) {
                slider.style.transition = "none";
                counter = 1;
                slider.style.transform = `translateX(-${getSlideWidth()}px)`;
            }
            if (counter <= 0) {
                slider.style.transition = "none";
                counter = totalSlides;
                slider.style.transform = `translateX(${-getSlideWidth() * counter}px)`;
            }
        });

        if (nextBtn) nextBtn.addEventListener('click', () => move(1));
        if (prevBtn) prevBtn.addEventListener('click', () => move(-1));

        setInterval(() => move(1), 5000);

        window.addEventListener('resize', () => {
            slider.style.transition = "none";
            slider.style.transform = `translateX(${-getSlideWidth() * counter}px)`;
        });
    }

    /* ============================================================
        2. 高機能検索（index.html 用）
       ============================================================ */
    const searchInput = document.getElementById('horseSearch');
    const searchBtn = document.getElementById('searchBtn');
    const clearBtn = document.getElementById('clearBtn');
    const dataList = document.getElementById('horseList');
    const allCards = document.querySelectorAll('.horse-card:not(.result-card)');

    const hiraToKana = (str) => {
        return str.replace(/[ぁ-ん]/g, (s) => String.fromCharCode(s.charCodeAt(0) + 0x60));
    };

    const buildDatalist = () => {
        if (!dataList) return;
        dataList.innerHTML = '';
        const names = new Set();
        allCards.forEach(card => {
            const name = card.getAttribute('data-name');
            if (name) names.add(name);
        });
        names.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            dataList.appendChild(option);
        });
    };
    buildDatalist();

    if (searchInput) {
    // ✅ 追加: IME変換中フラグ
    let isComposing = false;

    searchInput.addEventListener('compositionstart', () => {
        isComposing = true;
    });

    searchInput.addEventListener('compositionend', (e) => {
        isComposing = false;
        const converted = hiraToKana(e.target.value);
        e.target.value = converted;
        if (clearBtn) {
            clearBtn.style.display = e.target.value.length > 0 ? "block" : "none";
        }
        if (document.getElementById('allHorseGrid')) {
            applyFilters();
        } else {
            updateDisplay();
        }
    });

    searchInput.addEventListener('input', (e) => {
        if (isComposing) return; // ✅ 追加: 変換中はスキップ
        const converted = hiraToKana(e.target.value);
        if (e.target.value !== converted) e.target.value = converted;
        if (clearBtn) {
            clearBtn.style.display = e.target.value.length > 0 ? "block" : "none";
        }
        if (document.getElementById('allHorseGrid')) {
            applyFilters();
        } else {
            updateDisplay();
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        searchInput.focus();
        // ✅ 追加: 全セクションを再表示
        document.querySelectorAll('.horse-section').forEach(section => {
            section.style.display = '';
        });
        const resultSection = document.getElementById('searchResultsSection');
        if (resultSection) resultSection.style.display = 'none';
        if (document.getElementById('allHorseGrid')) {
            applyFilters();
        } else {
            updateDisplay();
        }
    });
}

    const performSearch = () => {
    const val = searchInput ? searchInput.value.trim() : '';
    const resultSection = document.getElementById('searchResultsSection');
    const resultGrid = document.getElementById('searchResultGrid');
    if (!val || !resultSection || !resultGrid) return;

    const staticCards = document.querySelectorAll('.horse-card:not(.result-card)');
    const targetCards = Array.from(staticCards).filter(card => card.getAttribute('data-name') === val);

    const seen = new Set();
    const uniqueCards = targetCards.filter(card => {
        const name = card.getAttribute('data-name');
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
    });

    // ✅ 追加: 全セクションを隠す
    document.querySelectorAll('.horse-section').forEach(section => {
        section.style.display = 'none';
    });

    if (uniqueCards.length > 0) {
        resultGrid.innerHTML = '';
        uniqueCards.forEach(card => {
            const name = card.getAttribute('data-name');
            const img = card.querySelector('img')?.src || '';
            const href = card.getAttribute('href') || '#';
            const infoHTML = card.querySelector('.card-info')?.innerHTML || `<h4>${name}</h4>`;
            const resultLink = document.createElement('a');
            resultLink.href = href;
            resultLink.className = 'horse-card result-card';
            resultLink.style.display = "block";
            resultLink.innerHTML = `<img src="${img}" alt="${name}"><div class="card-info">${infoHTML}</div>`;
            resultGrid.appendChild(resultLink);
        });
        resultSection.style.display = "block"; // ✅ 結果セクションだけ表示
        setTimeout(() => resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    } else {
        resultSection.style.display = "none";
        alert("「" + val + "」は見つかりませんでした。");
    }
};

    if (searchBtn) searchBtn.addEventListener('click', performSearch);

    function updateDisplay() {
        const searchVal = searchInput ? searchInput.value.toLowerCase() : '';
        allCards.forEach(card => {
            if (card.closest('#hiddenHorseData')) {
                card.style.display = "none";
                return;
            }
            const name = (card.getAttribute('data-name') || "").toLowerCase();
            card.style.display = name.includes(searchVal) ? "block" : "none";
        });
    }

    /* ============================================================
        3. all-horses.html 絞り込みフィルター
       ============================================================ */
    const genderFilter = document.getElementById('genderFilter');
    const colorFilter = document.getElementById('colorFilter');
    const resetBtn = document.getElementById('resetBtn');
    const matchCount = document.getElementById('matchCount');
    const allHorseGrid = document.getElementById('allHorseGrid');

    if (allHorseGrid) {
        const gridCards = allHorseGrid.querySelectorAll('.horse-card');

        function applyFilters() {
            const gender = genderFilter ? genderFilter.value : 'all';
            const color = colorFilter ? colorFilter.value : 'all';
            const searchVal = searchInput ? hiraToKana(searchInput.value.toLowerCase()) : '';

            let count = 0;

            gridCards.forEach(card => {
                const cardGender = card.getAttribute('data-gender') || '';
                const cardColor = card.getAttribute('data-color') || '';
                const cardName = (card.getAttribute('data-name') || '').toLowerCase();

                const genderMatch = gender === 'all' || cardGender === gender;
                const colorMatch = color === 'all' || cardColor === color;
                const searchMatch = searchVal === '' || cardName.includes(searchVal);

                if (genderMatch && colorMatch && searchMatch) {
                    card.style.display = 'block';
                    count++;
                } else {
                    card.style.display = 'none';
                }
            });

            if (matchCount) matchCount.textContent = `表示中: ${count}頭`;
        }

        if (genderFilter) genderFilter.addEventListener('change', applyFilters);
        if (colorFilter) colorFilter.addEventListener('change', applyFilters);

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (genderFilter) genderFilter.value = 'all';
                if (colorFilter) colorFilter.value = 'all';
                if (searchInput) {
                    searchInput.value = '';
                    if (clearBtn) clearBtn.style.display = 'none';
                }
                applyFilters();
            });
        }

        // 初期表示件数を正確にカウント
        applyFilters();
    }

    /* ============================================================
        4. レーダーチャート
       ============================================================ */
    const drawRadarChart = () => {
    const chartContainer = document.getElementById('radarChart');
    if (!chartContainer) return;
    try {
        const statsData = JSON.parse(chartContainer.dataset.stats);
        const labels = Object.keys(statsData);
        const values = Object.values(statsData);
        const size = 320;
        const center = size / 2;
        const radius = 100;
        const angleStep = (Math.PI * 2) / labels.length;

        let svgContent = `<svg class="radar-svg" viewBox="0 0 ${size} ${size}">`;

        // 背景グリッド
        for (let i = 1; i <= 5; i++) {
            const r = (radius / 5) * i;
            const points = labels.map((_, j) => {
                const x = center + r * Math.cos(angleStep * j - Math.PI / 2);
                const y = center + r * Math.sin(angleStep * j - Math.PI / 2);
                return `${x},${y}`;
            }).join(' ');
            svgContent += `<polygon points="${points}" style="fill:none; stroke:#ccc; stroke-width:0.5;" />`;
        }

        // 軸線
        labels.forEach((_, j) => {
            const x = center + radius * Math.cos(angleStep * j - Math.PI / 2);
            const y = center + radius * Math.sin(angleStep * j - Math.PI / 2);
            svgContent += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" style="stroke:#ccc; stroke-width:0.5;" />`;
        });

        // データエリア
        const areaPoints = values.map((val, i) => {
            const r = (radius * val) / 100;
            const x = center + r * Math.cos(angleStep * i - Math.PI / 2);
            const y = center + r * Math.sin(angleStep * i - Math.PI / 2);
            return `${x},${y}`;
        }).join(' ');
        svgContent += `<polygon points="${areaPoints}" style="fill:rgba(212, 175, 55, 0.5); stroke:#d4af37; stroke-width:2;" />`;

        // ✅ ラベル
        labels.forEach((label, j) => {
            const labelRadius = radius + 28;
            const x = center + labelRadius * Math.cos(angleStep * j - Math.PI / 2);
            const y = center + labelRadius * Math.sin(angleStep * j - Math.PI / 2);
            svgContent += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" style="font-size:11px; fill:#333; font-weight:bold;">${label}</text>`;
        });

        // ✅ 各頂点に数値
        values.forEach((val, i) => {
            const r = (radius * val) / 100;
            const x = center + r * Math.cos(angleStep * i - Math.PI / 2);
            const y = center + r * Math.sin(angleStep * i - Math.PI / 2);
            svgContent += `<text x="${x}" y="${y - 6}" text-anchor="middle" style="font-size:10px; fill:#d4af37; font-weight:bold;">${val}</text>`;
        });

        svgContent += `</svg>`;
        chartContainer.innerHTML = svgContent;
    } catch (e) { console.error(e); }
    };
    drawRadarChart();
};