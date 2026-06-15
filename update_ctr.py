import os
import re
import json

base_dir = "/Users/gsf/.gemini/antigravity/scratch/projects/GSF-Blog/src/data/blog"

updates = {
    "tokyo-ward-guide-series-prologue": {
        "en": {
            "title": "Tokyo 23 Wards Complete Guide: Where to Live & Invest [2026]",
            "description": "Discover the definitive guide to Tokyo's 23 wards. Explore demographics, infrastructure, and urban characteristics to find the perfect area for you."
        },
        "ko": {
            "title": "도쿄 23구 완전 정복: 거주와 투자 관점 가이드 [2026]",
            "description": "도쿄 23구의 각 구별 특징, 인프라, 거주 환경을 분석합니다. 어디에 살고 어디에 주목해야 할지 구체적인 가이드를 확인하세요."
        },
        "ja": {
            "title": "東京23区完全ガイド：居住・投資視点でのエリア解説 [2026]",
            "description": "東京23区の特徴、インフラ、人口動態を徹底比較。居住や不動産検討に役立つ、エリア別の詳細なガイドをご覧ください。"
        }
    },
    "tokyo-core-3-wards-chiyoda-chuo-minato": {
        "en": {
            "title": "Chiyoda, Chuo & Minato: Tokyo's 3 Premium Wards Data",
            "description": "Learn which ward to invest in based on vacancy rates, price trends, and developer pipelines in Tokyo's premium central 3 wards."
        },
        "ko": {
            "title": "도쿄 도심 3구 (치요다, 추오, 미나토): 프리미엄 입지 분석",
            "description": "도쿄 최상위 핵심 입지인 도심 3구의 공실률, 지가 동향, 향후 개발 파이프라인 데이터를 확인하고 입지적 가치를 비교해 보세요."
        },
        "ja": {
            "title": "都心3区（千代田・中央・港）：東京のプレミアムエリアデータ分析",
            "description": "千代田区、中央区、港区の空室率、地価動向、再開発パイプラインのデータを比較。東京の最上位エリアの立地価値を確認してください。"
        }
    },
    "tokyo-real-estate-investment-complete-guide": {
        "en": {
            "title": "Tokyo Real Estate Investment: Complete Step-by-Step Guide [2026]",
            "description": "Discover the step-by-step process of buying real estate in Tokyo. See 2026 data on market trends, taxes, and practical advice for global buyers."
        },
        "ko": {
            "title": "도쿄 부동산 매수 A to Z: 단계별 완전 가이드 [2026]",
            "description": "도쿄 부동산 매수를 위한 단계별 가이드. 2026년 최신 시장 데이터, 세금, 그리고 글로벌 매수자를 위한 실무 절차를 확인해 보세요."
        },
        "ja": {
            "title": "東京不動産購入の完全ガイド：ステップバイステップの手順 [2026]",
            "description": "東京での不動産購入プロセスをステップバイステップで解説。2026年の市場データ、税金、グローバル購入者向けの実務手順をご確認ください。"
        }
    },
    "tokyo-6-wards-real-estate-insight": {
        "en": {
            "title": "Tokyo's 6 Key Wards: Real Estate Data & Investment Insights [2026]",
            "description": "Analyze price trends and demographic shifts in Tokyo's 6 key wards. See the data to understand the future of Tokyo's urban landscape."
        },
        "ko": {
            "title": "도쿄 주요 6구 부동산 데이터 및 입지 인사이트 [2026]",
            "description": "도쿄 주요 6구의 부동산 가격 동향과 인구 변화 데이터를 분석합니다. 최신 지표를 통해 도쿄 도심의 변화 양상을 확인해 보세요."
        },
        "ja": {
            "title": "東京主要6区の不動産データと投資インサイト [2026]",
            "description": "東京主要6区の不動産価格動向と人口推移データを分析。最新の指標を通じて、東京の都市構造の変化とエリア価値を確認してください。"
        }
    },
    "japan-rate-hike-cycle-j-reit-three-lessons": {
        "en": {
            "title": "Japan Rate Hike & J-REIT: 3 Lessons from the 2024-2026 Cycle",
            "description": "Find out how the Bank of Japan's rate hike cycle affects J-REITs. Discover 3 essential macro lessons for understanding the Japanese market."
        },
        "ko": {
            "title": "일본 금리 인상과 J-REIT: 2024-2026 사이클에서 배우는 3가지 교훈",
            "description": "일본은행(BOJ)의 금리 인상 사이클이 J-REIT 시장에 미치는 영향을 분석합니다. 일본 매크로 환경을 이해하기 위한 3가지 핵심 교훈을 확인하세요."
        },
        "ja": {
            "title": "日本の利上げとJ-REIT：2024-2026年サイクルから学ぶ3つの教訓",
            "description": "日銀の利上げサイクルがJ-REIT市場に与える影響を分析。日本のマクロ環境を理解するための3つの重要な教訓を確認してください。"
        }
    },
    "nihonbashi-hamacho-supermarket-peacock-city-life": {
        "en": {
            "title": "Nihonbashi Hamacho City Life: Peacock Store & Convenience",
            "description": "Discover the convenience of living in Nihonbashi Hamacho. Explore local supermarkets like Peacock Store, daily amenities, and neighborhood charm."
        },
        "ko": {
            "title": "니혼바시 하마초 라이프: 피코크 스토어와 도심 속 편의성",
            "description": "도심 속 주거지 니혼바시 하마초의 생활 편의성을 소개합니다. 피코크 스토어 등 주요 슈퍼마켓과 동네의 매력을 직접 확인해 보세요."
        },
        "ja": {
            "title": "日本橋浜町ライフ：ピーコックストアと都心の利便性",
            "description": "都心の住宅街・日本橋浜町の生活利便性を紹介します。ピーコックストアなどのスーパーや日常の買い物環境、街の魅力をご覧ください。"
        }
    },
    "tokyo-shinjuku-shibuya-bunkyo": {
        "en": {
            "title": "Shinjuku, Shibuya & Bunkyo: Tokyo's Creative & Academic Wards",
            "description": "Explore the characteristics of Shinjuku, Shibuya, and Bunkyo. Learn about Tokyo's commercial hubs, cultural centers, and educational districts."
        },
        "ko": {
            "title": "신주쿠, 시부야, 분쿄구: 도쿄의 상업 및 교육 중심지 분석",
            "description": "도쿄 서부의 핵심인 신주쿠, 시부야와 교육 중심지 분쿄구의 특징을 비교합니다. 각 구의 상권, 문화, 주거 환경의 차이를 알아보세요."
        },
        "ja": {
            "title": "新宿、渋谷、文京区：東京の商業・教育の中心地ガイド",
            "description": "東京の副都心である新宿・渋谷と、文教地区である文京区の特徴を比較。各区の商業、文化、居住環境の違いについて解説します。"
        }
    },
    "nihonbashi-mitsui-redevelopment-pipeline-three": {
        "en": {
            "title": "Nihonbashi Mitsui Redevelopment: 3 Projects Reshaping Tokyo",
            "description": "Find out about Mitsui Fudosan's massive redevelopment pipeline in Nihonbashi. See how these 3 major projects will transform Tokyo's historic core."
        },
        "ko": {
            "title": "니혼바시 미쓰이 재개발: 도쿄의 중심을 바꾸는 3대 파이프라인",
            "description": "미쓰이 부동산이 주도하는 니혼바시 핵심 재개발 프로젝트 3가지를 분석합니다. 도쿄의 역사적 중심지가 어떻게 변화할지 확인해 보세요."
        },
        "ja": {
            "title": "日本橋の三井不動産再開発：東京の中心を変える3大プロジェクト",
            "description": "三井不動産が主導する日本橋の主要再開発プロジェクト3つを分析。東京の歴史的中心地がどのように進化するのか、その全貌をご覧ください。"
        }
    }
}

results = []

for slug, locales in updates.items():
    for locale, changes in locales.items():
        file_path = os.path.join(base_dir, locale, f"{slug}.md")
        if not os.path.exists(file_path):
            file_path = os.path.join(base_dir, locale, f"{slug}.mdx")
        
        if not os.path.exists(file_path):
            results.append({
                "slug": slug,
                "locale": locale,
                "status": "not_found"
            })
            continue
            
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # extract old title and description
        old_title_match = re.search(r'^title:\s*(.*)$', content, re.MULTILINE)
        old_desc_match = re.search(r'^description:\s*(.*)$', content, re.MULTILINE)
        
        old_title = old_title_match.group(1).strip() if old_title_match else ""
        old_desc = old_desc_match.group(1).strip() if old_desc_match else ""
        
        # replace
        new_title = f'"{changes["title"]}"'
        new_desc = f'"{changes["description"]}"'
        
        new_content = re.sub(r'^title:\s*.*$', f'title: {new_title}', content, flags=re.MULTILINE)
        new_content = re.sub(r'^description:\s*.*$', f'description: {new_desc}', new_content, flags=re.MULTILINE)
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
            
        results.append({
            "slug": slug,
            "locale": locale,
            "old_title": old_title.strip('"\''),
            "new_title": changes["title"],
            "old_desc": old_desc.strip('"\''),
            "new_desc": changes["description"]
        })

print(json.dumps(results, indent=2, ensure_ascii=False))
