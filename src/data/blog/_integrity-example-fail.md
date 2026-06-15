---
title: "Integrity Gate Fail Example"
description: "Example frontmatter that fails integrity checks."
pubDatetime: 2026-04-17T18:00:00.000Z
lang: en
tags:
  - integrity
  - example
draft: true
sources:
  - "https://www.molit.go.kr/"
  - "https://www.yna.co.kr/"
references:
  - "https://www.yna.co.kr/"
---

Failure reasons:
- `references` includes a URL not present in `sources`.
- If strict mode is enabled with min sources >= 2, source count also fails.

