#!/usr/bin/env python3
"""
Generate Tokyo Office Vacancy Rate chart images (EN/KO/JA) for static embedding.
Output: public/assets/images/blog/tokyo-office-vacancy-chart-{en,ko,ja}.png
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
from pathlib import Path

# ── Data ──────────────────────────────────────────────────────────────────────
months      = ['2023.01','2023.07','2024.01','2024.07','2025.01','2025.07','2026.03']
vacancy_pct = [      5.3,     4.6,      4.0,      3.4,      2.9,      2.6,      2.22]

# ── Output dir ────────────────────────────────────────────────────────────────
out_dir = Path(__file__).parent.parent / 'public' / 'assets' / 'images' / 'blog'
out_dir.mkdir(parents=True, exist_ok=True)

CONFIGS = {
    'en': {
        'title':   'Tokyo 5 Central Wards Office Vacancy Trend',
        'subtitle':'Source: Miki Shoji  |  Unit: %  |  Jan 2023 – Mar 2026',
        'ylabel':  'Vacancy Rate (%)',
        'current': '2.22 % (Q1 2026)',
        'fname':   'tokyo-office-vacancy-chart-en.png',
    },
    'ko': {
        'title':   '도쿄 도심 5구 오피스 공실률 추이',
        'subtitle':'출처: 미키 쇼지  |  단위: %  |  2023.01 – 2026.03',
        'ylabel':  '공실률 (%)',
        'current': '2.22 % (2026년 1분기)',
        'fname':   'tokyo-office-vacancy-chart-ko.png',
    },
    'ja': {
        'title':   '東京都心5区オフィス空室率推移',
        'subtitle':'出典：三鬼商事  |  単位：%  |  2023年1月 – 2026年3月',
        'ylabel':  '空室率 (%)',
        'current': '2.22 %（2026年Q1）',
        'fname':   'tokyo-office-vacancy-chart-ja.png',
    },
}

for lang, cfg in CONFIGS.items():
    fig, ax = plt.subplots(figsize=(9, 4.2))
    fig.patch.set_facecolor('#FAFAFA')
    ax.set_facecolor('#FAFAFA')

    # Area fill
    ax.fill_between(range(len(months)), vacancy_pct,
                    alpha=0.15, color='#2563EB')

    # Main line
    ax.plot(range(len(months)), vacancy_pct,
            color='#2563EB', linewidth=2.5, marker='o',
            markersize=6, markerfacecolor='white', markeredgewidth=2.2,
            markeredgecolor='#2563EB', zorder=5)

    # Highlight last point
    ax.plot(len(months)-1, vacancy_pct[-1],
            'o', color='#1D4ED8', markersize=10, zorder=6)

    # Callout label for last point
    ax.annotate(cfg['current'],
                xy=(len(months)-1, vacancy_pct[-1]),
                xytext=(-62, 14),
                textcoords='offset points',
                fontsize=10, fontweight='bold', color='white',
                bbox=dict(boxstyle='round,pad=0.4', fc='#1D4ED8', ec='none'))

    # Grid
    ax.yaxis.grid(True, linestyle='--', linewidth=0.6, color='#E5E7EB', zorder=0)
    ax.set_axisbelow(True)
    ax.spines[['top','right','left']].set_visible(False)
    ax.spines['bottom'].set_color('#D1D5DB')

    # Axes
    ax.set_xticks(range(len(months)))
    ax.set_xticklabels(months, fontsize=9, color='#6B7280', rotation=15)
    ax.set_ylabel(cfg['ylabel'], fontsize=10, color='#374151')
    ax.set_ylim(0, 7)
    ax.tick_params(axis='y', colors='#9CA3AF', labelsize=9)
    ax.tick_params(axis='x', length=0)

    # Title
    fig.suptitle(cfg['title'], fontsize=13, fontweight='bold',
                 color='#111827', x=0.02, ha='left', y=1.01)
    ax.set_title(cfg['subtitle'], fontsize=8.5, color='#9CA3AF',
                 loc='left', pad=4)

    plt.tight_layout()
    out_path = out_dir / cfg['fname']
    fig.savefig(out_path, dpi=150, bbox_inches='tight',
                facecolor=fig.get_facecolor())
    plt.close(fig)
    print(f"✅ {out_path}")

print("Done.")
