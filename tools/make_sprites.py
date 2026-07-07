#!/usr/bin/env python3
"""16x16 픽셀아트 스프라이트 생성기.

각 스프라이트는 16줄 ASCII 그리드로 정의한다.
'.' = 투명, 'K' = 외곽선, 나머지 문자는 팔레트에서 색을 찾는다.
출력: assets/sprites/<이름>.png (16x16 원본)
"""
import os
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'sprites')

OUTLINE = (26, 20, 36, 255)   # K 공통 외곽선
SKIN = (240, 200, 160, 255)   # F 공통 피부
EYE = (255, 255, 255, 255)    # E 흰 눈
DOT = (30, 24, 40, 255)       # P 눈동자

COMMON = {'K': OUTLINE, 'F': SKIN, 'E': EYE, 'P': DOT}


def hexc(h):
    h = h.lstrip('#')
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)


SPRITES = {}


def sprite(name, palette, rows):
    assert len(rows) == 16, f'{name}: {len(rows)} rows'
    for i, r in enumerate(rows):
        assert len(r) == 16, f'{name} row {i}: {len(r)} cols'
    SPRITES[name] = (palette, rows)


# ───────────────────────── 영웅 ─────────────────────────

sprite('hero_warrior', {
    'S': hexc('#c8d2e0'), 's': hexc('#8a96b0'),  # 강철
    'R': hexc('#c84040'),                        # 투구 깃
    'B': hexc('#3a5a9c'), 'b': hexc('#2a4070'),  # 청색 천
    'W': hexc('#6a4a2a'),                        # 부츠
}, [
    '.......KK.......',
    '......KRRK......',
    '.....KSSSSK.....',
    '....KSsSSsSK....',
    '....KSSSSSSK....',
    '....KsKKKKsK....',
    '....KFEPFEPK....',
    '.....KFFFFK.....',
    '...KKKSSSSKKK...',
    '..KSsKSbbSKsSK..',
    '..KSsKSSSSKsSK..',
    '...KK.KSSK.KK...',
    '.....KsSSsK.....',
    '....KBBKKBBK....',
    '....KWWK.KWWK...',
    '.....KK...KK....',
])

sprite('hero_rogue', {
    'G': hexc('#3e6644'), 'g': hexc('#2a4830'),  # 후드 녹색
    'D': hexc('#585868'), 'd': hexc('#3c3c48'),  # 가죽옷
    'R': hexc('#a83848'),                        # 스카프
    'S': hexc('#c8d2e0'),                        # 단검 날
}, [
    '................',
    '......KKKK......',
    '.....KGGGGK.....',
    '....KGgGGgGK....',
    '....KGGGGGGK....',
    '....KgKKKKgK....',
    '....KFEPFEPK....',
    '.....KRRRRK.....',
    '...KKKDDDDKKK...',
    '..KDdKDddDKdDK..',
    '..KDdKDDDDKdKSK.',
    '...KK.KDDK.KKSK.',
    '.....KdDDdK.KK..',
    '....KddKKddK....',
    '....KddK.KddK...',
    '.....KK...KK....',
])

sprite('hero_mage', {
    'H': hexc('#6a4ab0'), 'h': hexc('#4c3284'),  # 모자/로브 보라
    'Y': hexc('#e8c860'),                        # 별/장식
    'B': hexc('#8a6ad0'),                        # 로브 밝은
    'W': hexc('#8a5a30'),                        # 지팡이
}, [
    '.......KK.......',
    '......KHHK......',
    '.....KHHhHK.....',
    '....KHHYHHHK....',
    '..KKHHHHHHHHKK..',
    '.KhHHhhhhhhHHhK.',
    '..KKKKKKKKKKKK..',
    '....KFEPFEPK....',
    '.....KFFFFK.....',
    '..KKKHHHHHHKKK..',
    '.KWWKHhHHhHKBBK.',
    '.KWWKHHHHHHKBBK.',
    '..KK.KhHHhK.KK..',
    '.....KHHHHK.....',
    '....KhhKKhhK....',
    '.....KK...KK....',
])

sprite('hero_cleric', {
    'W': hexc('#f0ead8'), 'w': hexc('#c8c0a8'),  # 흰 로브
    'Y': hexc('#e8c040'), 'y': hexc('#b09028'),  # 금장식
    'H': hexc('#e8b868'),                        # 금발
}, [
    '................',
    '......KKKK......',
    '.....KHHHHK.....',
    '....KHHhHHHK....'.replace('h', 'H'),
    '....KWWWWWWK....',
    '....KwKKKKwK....',
    '....KFEPFEPK....',
    '.....KFFFFK.....',
    '...KKKWWWWKKK...',
    '..KWwKWYYWKwWK..',
    '..KWwKWYYWKwWK..',
    '...KK.KWWK.KK...',
    '.....KwWWwK.....',
    '.....KWWWWK.....',
    '....KwwKKwwK....',
    '.....KK...KK....',
])

# ───────────────────────── 몬스터 ─────────────────────────

sprite('goblin', {
    'G': hexc('#6aa848'), 'g': hexc('#4a7c34'),  # 녹색 피부
    'B': hexc('#7a5a34'),                        # 가죽
}, [
    '................',
    '................',
    '..K..........K..',
    '.KGK.KKKKK..KGK.',
    '.KGGKGGGGGKKGGK.',
    '..KGGGgGGGGGGK..',
    '...KGGGGGGGGK...',
    '...KGEPGGEPGK...',
    '...KGGGKKGGGK...',
    '....KGGGGGGK....',
    '..KKKGGGGGGKKK..',
    '.KGgKBBBBBBKgGK.',
    '..KK.KBBBBK.KK..',
    '....KGGKKGGK....',
    '....KgGK.KGgK...',
    '.....KK...KK....',
])

sprite('wolf', {
    'W': hexc('#9098a8'), 'w': hexc('#6a7284'),  # 회색 털
    'T': hexc('#c8ccd8'),                        # 배/이빨
}, [
    '................',
    '................',
    '..KK......KK....',
    '.KWWK....KWWK...',
    '.KWwWKKKKWwWK...',
    '.KWWWWWWWWWWK...',
    'KWEPWWWWWWWWWK..',
    'KWWWWWWWWWWWWWK.',
    'KTKTKWWWWWWWWWK.',
    '.KKKWWWWWWWwWWK.',
    '...KwWWWWWWWwK..',
    '...KWWwwwWWWK...',
    '...KWK..KWWK....',
    '...KWK...KWK....',
    '..KwK....KwK....',
    '..KK......KK....',
])

sprite('slime', {
    'G': hexc('#58c058'), 'g': hexc('#3a9040'),  # 젤리
    'L': hexc('#a0e8a0'),                        # 하이라이트
}, [
    '................',
    '................',
    '................',
    '................',
    '......KKKK......',
    '....KKGGGGKK....',
    '...KGGLLGGGGK...',
    '..KGGLLGGGGGGK..',
    '..KGGLGGGGGGGK..',
    '.KGGGGGGGGGGGGK.',
    '.KGEPGGGGGEPGGK.',
    '.KGGGGGGGGGGGGK.',
    '.KgGGGKKKKGGGgK.',
    '.KgGGGGGGGGGGgK.',
    '..KggggggggggK..',
    '...KKKKKKKKKK...',
])

sprite('skeleton', {
    'W': hexc('#e8e4d8'), 'w': hexc('#b0aa98'),  # 뼈
}, [
    '................',
    '.....KKKKKK.....',
    '....KWWWWWWK....',
    '....KWWWWWWK....',
    '....KWWWWWWK....',
    '....KKPWWKPK....',
    '.....KWWWWK.....',
    '.....KKKKKK.....',
    '...KKKWWWWKKK...',
    '..KWwKWKKWKwWK..',
    '..KWwKKWWKKwWK..',
    '...KK.KWWK.KK...',
    '.....KwKKwK.....',
    '....KWWKKWWK....',
    '....KwWK.KWwK...',
    '.....KK...KK....',
])

sprite('orc', {
    'G': hexc('#4a8848'), 'g': hexc('#356434'),  # 짙은 녹색
    'T': hexc('#e8e4d8'),                        # 엄니
    'B': hexc('#6a4a2a'), 'b': hexc('#4c3620'),  # 가죽 갑옷
}, [
    '................',
    '....KKKKKKKK....',
    '...KGGGGGGGGK...',
    '..KGGgGGGGgGGK..',
    '..KGGGGGGGGGGK..',
    '..KGEPGGGGEPGK..',
    '..KGGGGKKGGGGK..',
    '..KGTKGGGGKTGK..',
    '..KKKBBBBBBKKK..',
    '.KGgKBbBBbBKgGK.',
    '.KGgKBBBBBBKgGK.',
    '..KK.KBBBBK.KK..',
    '.....KbBBbK.....',
    '....KGGKKGGK....',
    '....KgGK.KGgK...',
    '.....KK...KK....',
])

sprite('bat', {
    'V': hexc('#7a5aa8'), 'v': hexc('#553c7c'),  # 보라 날개
    'B': hexc('#9a7ac8'),                        # 몸통
}, [
    '................',
    '................',
    '................',
    '..K..........K..',
    '.KVK...KK...KVK.',
    'KVVVK.KBBK.KVVVK',
    'KVvVVKBBBBKVVvVK',
    'KVVVVBBBBBBVVVVK',
    '.KVVBBEPEPBBVVK.',
    '..KVBBBBBBBBVK..',
    '...KKBKBBKBKK...',
    '.....KBBBBK.....',
    '......KKKK......',
    '................',
    '................',
    '................',
])

sprite('darkmage', {
    'H': hexc('#4c3284'), 'h': hexc('#362258'),  # 어둠 로브
    'R': hexc('#c04060'),                        # 눈빛
    'W': hexc('#6a4a90'),                        # 지팡이
}, [
    '.......KK.......',
    '......KHHK......',
    '.....KHHHHK.....',
    '....KHhHHhHK....',
    '...KHHHHHHHHK...',
    '..KHhhhhhhhhHK..',
    '..KKKKKKKKKKKK..',
    '....KPRPPRPK....',
    '.....KPPPPK.....',
    '..KKKHHHHHHKKK..',
    '.KWWKHhHHhHKHhK.',
    '.KWWKHHHHHHKHhK.',
    '..KK.KhHHhK.KK..',
    '.....KHHHHK.....',
    '.....KhhhhK.....',
    '......KKKK......',
])

sprite('spider', {
    'B': hexc('#3c3444'), 'b': hexc('#28222e'),  # 검은 몸
    'R': hexc('#c04040'),                        # 붉은 무늬
}, [
    '................',
    '................',
    'K..K........K..K',
    '.K..K......K..K.',
    '..K..K.KK.K..K..',
    '...K.KKBBKK.K...',
    '....KKBBBBKK....',
    '..KKKBBRRBBKKK..',
    '.K...KBRRBK...K.',
    '.....KBBBBK.....',
    '....KBBBBBBK....',
    '...KBbEPEPbBK...',
    '...KBBBBBBBBK...',
    '....KbBBBBbK....',
    '.....KKKKKK.....',
    '................',
])

sprite('troll', {
    'G': hexc('#7a8850'), 'g': hexc('#5a6638'),  # 트롤 피부
    'B': hexc('#6a4a2a'),                        # 허리천
    'T': hexc('#e8e4d8'),                        # 이빨
}, [
    '....KKKKKKKK....',
    '...KGGGGGGGGK...',
    '..KGGgGGGGgGGK..',
    '..KGGGGGGGGGGK..',
    '..KGEPGGGGEPGK..',
    '..KGGGGGGGGGGK..',
    '..KGGTKKKKTGGK..',
    '..KKKGGGGGGKKK..',
    '.KGgKGGGGGGKgGK.',
    'KGGgKGgGGgGKgGGK',
    'KGgK.KGGGGK.KgGK',
    '.KK..KBBBBK..KK.',
    '.....KBBBBK.....',
    '....KGGKKGGK....',
    '...KGgGK.KGgGK..',
    '....KKK...KKK...',
])

sprite('gargoyle', {
    'S': hexc('#8890a0'), 's': hexc('#606878'),  # 돌
    'R': hexc('#d05050'),                        # 눈
}, [
    '................',
    '..KK........KK..',
    '.KSsK..KK..KsSK.',
    '.KSssK KK KssSK.'.replace(' ', '.'),
    '.KSsssKKKKsssSK.',
    '.KSsKSSSSSSKsSK.',
    '..KKKSsSSsSKKK..',
    '....KSSSSSSK....',
    '....KREPPERK....'.replace('R', 'S').replace('E', 'R'),
    '....KSSKKSSK....',
    '..KKKSSSSSSKKK..',
    '.KSsKSsSSsSKsSK.',
    '..KK.KSSSSK.KK..',
    '....KSSKKSSK....',
    '....KsSK.KSsK...',
    '.....KK...KK....',
])

sprite('wraith', {
    'W': hexc('#7a9ab8'), 'w': hexc('#54708c'),  # 유령 갑주
    'C': hexc('#a8d0e8'),                        # 냉기
}, [
    '.....KKKKKK.....',
    '....KWWWWWWK....',
    '...KWwWWWWwWK...',
    '...KWWWWWWWWK...',
    '...KKCPWWCPKK...',
    '....KWWWWWWK....',
    '.....KKKKKK.....',
    '...KKKWWWWKKK...',
    '..KWwKWwwWKwWK..',
    '..KWwKWWWWKwWK..',
    '...KK.KWWK.KK...',
    '.....KwWWwK.....',
    '.....KWWWWK.....',
    '......KwwK......',
    '.......KwK......',
    '........K.......',
])

sprite('chimera', {
    'Y': hexc('#d0a040'), 'y': hexc('#a87c28'),  # 사자 몸
    'M': hexc('#8a5a20'), 'm': hexc('#6a4418'),  # 갈기
    'T': hexc('#e8e4d8'),
}, [
    '................',
    '....KKKK........',
    '...KMMMMK..KK...',
    '..KMYYYYMKKYYK..',
    '.KMYEPYYYMKYYK..',
    '.KMYYYYYYMKYYK..',
    '.KMYTKKTYMKYYK..',
    '..KMYYYYMKYYYK..',
    '...KKKKYYYYYYK..',
    '...KYYYYYYYyYK..',
    '..KYYYYYYYYyYK..',
    '..KYYyyyyYYYK...',
    '..KYK...KYYK....',
    '..KYK...KYK.....',
    '.KyK....KyK.....',
    '.KK.....KK......',
])

# ───────────────────────── 보스 ─────────────────────────

sprite('boss_goblin', {
    'G': hexc('#6aa848'), 'g': hexc('#4a7c34'),
    'B': hexc('#8a3030'), 'b': hexc('#642020'),  # 붉은 망토
    'Y': hexc('#e8c040'),                        # 왕관
}, [
    '....Y.Y..Y.Y....',
    '....YYYYYYYY....',
    '..K.YYYYYYYY.K..',
    '.KGKKGGGGGGKKGK.',
    '.KGGKGgGGgGKGGK.',
    '..KGGGGGGGGGGK..',
    '...KGEPGGEPGK...',
    '...KGGGKKGGGK...',
    '....KGGGGGGK....',
    '..KKKBBBBBBKKK..',
    '.KGgKBBbbBBKgGK.',
    '..KK.KBBBBK.KK..',
    '.....KbBBbK.....',
    '....KGGKKGGK....',
    '....KgGK.KGgK...',
    '.....KK...KK....',
])

sprite('boss_skeleton', {
    'W': hexc('#e8e4d8'), 'w': hexc('#b0aa98'),
    'H': hexc('#4c3284'), 'h': hexc('#362258'),  # 보라 망토
    'Y': hexc('#e8c040'),
}, [
    '....Y.YY.Y......',
    '....YYYYYY......',
    '....KKKKKK......',
    '...KWWWWWWK.....',
    '...KWWWWWWK.....',
    '...KKPWWKPK.....',
    '....KWWWWK......',
    '....KKKKKKKKK...',
    '..KKKWWWWKKhHK..',
    '.KWwKWKKWKKhHK..',
    '.KWwKKWWKKKhHK..',
    '..KK.KWWK.KhHK..',
    '....KwKKwKKhHK..',
    '...KWWKKWWKKK...',
    '...KwWK.KWwK....',
    '....KK...KK.....',
])

sprite('boss_witch', {
    'H': hexc('#284838'), 'h': hexc('#1a3226'),  # 심연 녹색 로브
    'R': hexc('#50e080'),                        # 마력 눈
    'W': hexc('#3a6a50'),
}, [
    '.......KK.......',
    '......KHHK......',
    '.....KHHHHK.....',
    '....KHhHHhHK....',
    '...KHHHHHHHHK...',
    '..KHhhhhhhhhHK..',
    '..KKKKKKKKKKKK..',
    '....KPRPPRPK....',
    '.....KPPPPK.....',
    '..KKKHHHHHHKKK..',
    '.KWWKHhHHhHKHhK.',
    '.KWRKHHHHHHKHhK.',
    '..KK.KhHHhK.KK..',
    '.....KHHHHK.....',
    '.....KhhhhK.....',
    '......KKKK......',
])

sprite('boss_giant', {
    'G': hexc('#88a8c0'), 'g': hexc('#607e98'),  # 서리 피부
    'B': hexc('#3a5a7c'),
    'T': hexc('#e8f4ff'),
}, [
    '....KKKKKKKK....',
    '...KGGGGGGGGK...',
    '..KGGgGGGGgGGK..',
    '..KGGGGGGGGGGK..',
    '..KGEPGGGGEPGK..',
    '..KGGGGGGGGGGK..',
    '..KGGTKKKKTGGK..',
    '..KKKGGGGGGKKK..',
    '.KGgKGGGGGGKgGK.',
    'KGGgKGgGGgGKgGGK',
    'KGgK.KGGGGK.KgGK',
    '.KK..KBBBBK..KK.',
    '.....KBBBBK.....',
    '....KGGKKGGK....',
    '...KGgGK.KGgGK..',
    '....KKK...KKK...',
])

sprite('boss_dragon', {
    'D': hexc('#3c3444'), 'd': hexc('#28222e'),  # 흑린
    'R': hexc('#d04828'), 'r': hexc('#902c14'),  # 화염 배
    'Y': hexc('#e8c040'),                        # 눈
}, [
    '..KK.........K..',
    '.KDDK.......KDK.',
    'KDDDDK.....KDDK.',
    'KDdDDDKKKKKDDDK.',
    '.KDDDDDDDDDDDK..',
    '.KDYPDDDDDDDK...',
    '.KDDDDKKKDDDDK..',
    '..KRKRKKDDDDDDK.',
    '...KKKKDDDdDDDK.',
    '....KDDDDDDdDDK.',
    '...KDRrRDDDDDK..',
    '..KDDRRrDDDDK...',
    '..KDDDDDDDDK....',
    '..KDDK.KDDK.....',
    '.KDdK...KDdK....',
    '.KK......KK.....',
])

# ───────────────────────── 아이템 ─────────────────────────

sprite('item_sword', {
    'S': hexc('#c8d2e0'), 's': hexc('#8a96b0'),
    'Y': hexc('#e8c040'), 'W': hexc('#6a4a2a'),
}, [
    '................',
    '...........KK...',
    '..........KSSK..',
    '.........KSsSK..',
    '........KSsSK...',
    '.......KSsSK....',
    '......KSsSK.....',
    '.....KSsSK......',
    '..K.KSsSK.......',
    '..KYKsSK........',
    '...KYYK.........',
    '..KWKYYK........',
    '.KWWK.KK........',
    '.KWK............',
    '..K.............',
    '................',
])

sprite('item_axe', {
    'S': hexc('#c8d2e0'), 's': hexc('#8a96b0'),
    'W': hexc('#6a4a2a'), 'w': hexc('#4c3620'),
}, [
    '................',
    '......KKKK......',
    '....KKSSSSK.....',
    '...KSSSsSSSK....',
    '..KSSK.KSSSK....',
    '..KSK..KsSSK....',
    '..KK..KWKSSK....',
    '.....KWWKKK.....',
    '....KWwWK.......',
    '...KWwWK........',
    '..KWwWK.........',
    '.KWwWK..........',
    '.KWWK...........',
    '..KK............',
    '................',
    '................',
])

sprite('item_staff', {
    'W': hexc('#8a5a30'), 'w': hexc('#6a4420'),
    'B': hexc('#58a8e8'), 'b': hexc('#3878b0'),
}, [
    '................',
    '.......KKK......',
    '......KBBBK.....',
    '.....KBbBBBK....',
    '.....KBBbBBK....',
    '......KBBBK.....',
    '.....KKWKK......',
    '.....KWwK.......',
    '....KWwK........',
    '....KWWK........',
    '...KWwK.........',
    '...KWWK.........',
    '..KWwK..........',
    '..KWK...........',
    '...K............',
    '................',
])

sprite('item_dagger', {
    'S': hexc('#c8d2e0'), 's': hexc('#8a96b0'),
    'D': hexc('#3c3c48'),
}, [
    '................',
    '................',
    '.........KK.....',
    '........KSSK....',
    '.......KSsSK....',
    '......KSsSK.....',
    '.....KSsSK......',
    '....KSsSK.......',
    '...KKSSK........',
    '..KDKsK.........',
    '.KDDKK..........',
    '.KDK............',
    '..K.............',
    '................',
    '................',
    '................',
])

sprite('item_plate', {
    'S': hexc('#c8d2e0'), 's': hexc('#8a96b0'),
    'Y': hexc('#e8c040'),
}, [
    '................',
    '................',
    '..KKK.....KKK...',
    '.KSSSKKKKKSSSK..',
    '.KSKSSSSSSSKSK..',
    '.KSKSsSSsSSKSK..',
    '..KKSSSSSSSKK...',
    '...KSSYYSSSK....',
    '...KSSYYSSSK....',
    '...KSsSSsSSK....',
    '...KSSSSSSSK....',
    '....KSsSSsK.....',
    '....KSSSSSK.....',
    '.....KKKKK......',
    '................',
    '................',
])

sprite('item_leather', {
    'B': hexc('#8a5c34'), 'b': hexc('#684424'),
    'D': hexc('#4c3620'),
}, [
    '................',
    '................',
    '..KKK.....KKK...',
    '.KBBBKKKKKBBBK..',
    '.KBKBBBBBBBKBK..',
    '.KBKBbBBbBBKBK..',
    '..KKBBBBBBBKK...',
    '...KBBDDBBBK....',
    '...KBBDDBBBK....',
    '...KBbBBbBBK....',
    '...KBBBBBBBK....',
    '....KBbBBbK.....',
    '....KBBBBBK.....',
    '.....KKKKK......',
    '................',
    '................',
])

sprite('item_robe', {
    'H': hexc('#6a4ab0'), 'h': hexc('#4c3284'),
    'Y': hexc('#e8c860'),
}, [
    '................',
    '................',
    '..KKK.....KKK...',
    '.KHHHKKKKKHHHK..',
    '.KHKHHHHHHHKHK..',
    '.KHKHhHHhHHKHK..',
    '..KKHHHHHHHKK...',
    '...KHHYYHHHK....',
    '...KHHYYHHHK....',
    '...KHhHHhHHK....',
    '...KHHHHHHHK....',
    '...KHhHHHhHK....',
    '...KHHHHHHHK....',
    '....KKKKKKK.....',
    '................',
    '................',
])

sprite('item_ring', {
    'Y': hexc('#e8c040'), 'y': hexc('#b09028'),
    'R': hexc('#d04868'), 'r': hexc('#f08aa8'),
}, [
    '................',
    '................',
    '................',
    '......KKKK......',
    '.....KRrRRK.....',
    '.....KRRrRK.....',
    '......KKKK......',
    '.....KYYYYK.....',
    '....KYK..KYK....',
    '...KYK....KYK...',
    '...KYK....KyK...',
    '...KYK....KyK...',
    '....KYK..KyK....',
    '.....KYyyYK.....',
    '......KKKK......',
    '................',
])

sprite('item_amulet', {
    'Y': hexc('#e8c040'), 'y': hexc('#b09028'),
    'B': hexc('#58a8e8'), 'b': hexc('#3878b0'),
}, [
    '................',
    '....KKK..KKK....',
    '...KY..KK..YK...',
    '...KY......YK...',
    '..KY........YK..',
    '..KY........YK..',
    '..KY........YK..',
    '...KY......YK...',
    '....KKYYYYKK....',
    '......KYYK......',
    '.....KYYYYK.....',
    '....KYBbBYK.....'.replace('.K', '.K'),
    '....KYBBbYK.....',
    '.....KYYYK......',
    '......KKK.......',
    '................',
])

sprite('item_charm', {
    'B': hexc('#58a8e8'), 'b': hexc('#3878b0'),
    'W': hexc('#e8f4ff'),
    'R': hexc('#a83848'),
}, [
    '................',
    '.......KK.......',
    '......KRRK......',
    '......KRRK......',
    '.....KKKKKK.....',
    '....KBBBBBBK....',
    '...KBBWBBBBBK...',
    '...KBWBBBBbBK...',
    '...KBBBBBBbBK...',
    '...KBBBKKBBBK...',
    '...KBBKPPKBBK...',
    '...KBBBKKBbBK...',
    '....KBBBBBBK....',
    '.....KBbbBK.....',
    '......KKKK......',
    '................',
])

sprite('item_potion', {
    'R': hexc('#e05868'), 'r': hexc('#b03848'),
    'G': hexc('#c8d2e0'),
    'W': hexc('#6a4a2a'),
}, [
    '................',
    '......KKKK......',
    '......KWWK......',
    '......KWWK......',
    '.....KGGGGK.....',
    '.....KG..GK.....',
    '....KG....GK....',
    '...KG..R...GK...',
    '..KG..RRR...GK..',
    '..KGRRRRRRRRGK..',
    '..KGRrRRRrRRGK..',
    '..KGRRrRRRrRGK..',
    '..KGrRRRRRRrGK..',
    '...KGrrrrrrGK...',
    '....KKKKKKKK....',
    '................',
])


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, (palette, rows) in SPRITES.items():
        pal = dict(COMMON)
        pal.update(palette)
        img = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
        px = img.load()
        for y, row in enumerate(rows):
            for x, ch in enumerate(row):
                if ch == '.':
                    continue
                if ch not in pal:
                    raise KeyError(f'{name}: 정의 안 된 색 문자 {ch!r} (row {y})')
                px[x, y] = pal[ch]
        img.save(os.path.join(OUT, f'{name}.png'))
    print(f'{len(SPRITES)}개 스프라이트 생성 완료 → {os.path.abspath(OUT)}')

    # 확인용 컨택트 시트 (8배 확대)
    names = sorted(SPRITES)
    cols = 8
    rows_n = (len(names) + cols - 1) // cols
    sheet = Image.new('RGBA', (cols * 144, rows_n * 160), (30, 24, 44, 255))
    from PIL import ImageDraw
    d = ImageDraw.Draw(sheet)
    for i, n in enumerate(names):
        img = Image.open(os.path.join(OUT, f'{n}.png')).resize((128, 128), Image.NEAREST)
        x, y = (i % cols) * 144 + 8, (i // cols) * 160 + 8
        sheet.paste(img, (x, y), img)
        d.text((x, y + 130), n, fill=(200, 195, 220, 255))
    sheet.save(os.path.join(OUT, '..', 'contact-sheet.png'))
    print('contact-sheet.png 생성')


if __name__ == '__main__':
    main()
