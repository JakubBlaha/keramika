# Keramika — Lada Bartoníková

Web a e-shop keramičky **Lady Bartoníkové**.

Lada ručně tvoří keramiku — misky, hrnky, vázy, anděly a další kousky do
domácnosti. Každý kus je originál a vzniká kus po kusu v jejím malém ateliéru
v **Brně**.

## Kontakt

- **Autorka:** Lada Bartoníková
- **Telefon:** +420 776 384 159
- **Sídlo / ateliér:** Brno, Česká republika

## O projektu

Minimalistický vícejazyčný web v teplých, zemitých tónech. Prezentuje tvorbu
a umožňuje prodej keramiky. Měna CZK.

Stránka „O nás“ je pojatá jako **„O mně“** — je to osobní web jedné autorky,
nikoli firmy.

## Tech stack

- **Framework:** SvelteKit (Svelte 5, runes)
- **Styling:** Tailwind CSS v4 (design tokeny v `src/routes/layout.css`)
- **i18n:** Paraglide JS — čeština (výchozí, bez prefixu) a angličtina (`/en`)
- **Data:** celý katalog je ve Firebase (Firestore + Storage); web ho čte při každém požadavku. Lokálně vše běží proti emulátorům Firebase, nikdy proti produkci.
- **Písma:** Cormorant Garamond (nadpisy) + Jost (text)

## Aktuální stav

Rozpracovaný **návrh designu**. Hotová je homepage (hero, přednosti, vybrané
produkty, teaser „O mně“), hlavička s mobilním menu, patička a průchod
**kategorie → produkty** (`/produkty`, `/produkty/[kategorie]`). Vše ve dvou
jazykových mutacích (cs/en).

## Vývoj

```bash
pnpm install
pnpm emulators   # terminál 1: emulátory Firebase (vyžaduje Javu 21+ a globální firebase-tools)
pnpm dev         # terminál 2
pnpm seed        # jednou: nahraje katalog ze scripts/seed-data/ a lokálního admina
```

Web poběží na `http://localhost:5173`. Do `/admin` se přihlásíte výběrem
`admin@example.com` v Google okně emulátoru. Data emulátorů se ukládají do
`.emulator-data/`.

Užitečné příkazy:

```bash
pnpm check    # svelte-check
pnpm lint     # prettier + eslint
pnpm build    # produkční build
pnpm test     # e2e testy (vlastní čisté emulátory; nejdřív zastavte pnpm emulators)
```

### Struktura

```
messages/
  cs.json, en.json         # zdroj všech textů (Paraglide)
src/
  app.html                 # HTML shell, načtení písem, lang přes Paraglide
  hooks.server.ts          # Paraglide middleware (locale)
  hooks.ts                 # reroute (de-lokalizace URL)
  lib/
    catalog.ts             # typy a pomocné funkce veřejného katalogu (bez dat)
    server/publicCatalog.ts # čtení katalogu z Firestore pro veřejný web
    paraglide/             # generovaný výstup Paraglide (git-ignored)
  routes/
    +layout.svelte         # obal stránek + patička
    Header.svelte          # hlavička s mobilním menu a přepínačem jazyka
    layout.css             # globální styly a design tokeny (Tailwind v4)
    +page.svelte           # homepage
    produkty/
      +page.svelte         # výběr kategorií
      [category]/          # výpis produktů dané kategorie
    produkt/
      [slug]/              # detail produktu
docs/
  requirements/            # testovatelné požadavky (REQ-*), zdroj pravdy
  TODO.md                  # roadmapa implementace
```
