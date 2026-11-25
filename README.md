# Dreamavera website

Static product, support and legal pages for Dreamavera: AI Bedtime Stories.

## Current app content

The landing page describes English and neutral Latin American Spanish support,
language selection in the app, language-specific narration choices and five
illustration styles. The four showcases match the app's bundled selection:

- Spanish: Nova y el Reino de las Nubes Iluminadas (Lily, Expressive).
- English: Mossy's Quiet Song.
- English: Beepbo's Bouncing Moon Muffins.
- English: Momo and the Cloud Who Lost Its Colors.

`assets/showcase-nova.jpg` is a byte-for-byte copy of chapter 1 from
`showcase_nova_cloud_kingdom_es_v1`; no artwork was regenerated. Lyra's older image
is retained in the repository but no longer appears in the gallery.

The website itself is English-only. Spanish support described here is an app
feature, not a website translation or automatic translation of existing stories.

## Subscription and privacy copy

Plan cards keep reference USD prices and distinguish features without obsolete
story/image counts or promises of unlimited generation. Monthly creation
allowances are disclosed in the plan footnote, FAQ and Terms, with a pointer to
the app's Subscription → Plan details before purchase.

Service-provider disclosures include ElevenLabs for the current app and Inworld
for earlier clients. Privacy copy also describes saved character designs and
illustration-reference processing. The original legal effective dates are kept;
the factual update date is November 25, 2026. These are product/data-flow
corrections, not a substitute for a legal review or a customer-transition plan.

Contact and privacy-request forms open a prefilled `mailto:` draft. They do not
send requests or confirmations themselves; the parent must send the draft from
their email app. Existing support addresses and store links remain unchanged.

## Local checks and preview

No package installation or build step is required:

```sh
node --test test/site.test.cjs
python3 -m http.server 8765 --bind 127.0.0.1 --directory .
```

Open http://127.0.0.1:8765/ for a local preview. Tests cover content parity,
showcase count, obsolete allowance claims, local links/anchors, language-help
interaction, tab/menu keyboard behavior, and email-form validation/feedback.

## Publication

These changes are local only. Publish the website through its existing hosting
workflow when the corresponding Dreamavera store release is ready. A source
commit is not a deployment. Keep the public domain and app's legal links working;
do not rename stable app/store identifiers during a copy update.
