# FitManager Design System

## 1. Nguyên tắc

- Một hệ hình học dùng cho cả dark và light: radius 10 / 14 / 20px, khoảng cách theo nhịp 8px, control cao tối thiểu 44px.
- Màu giao diện được lấy từ semantic token, không dùng màu nền hoặc màu chữ riêng theo từng page.
- Primary action dùng xanh FitManager; cảnh báo và trạng thái dùng màu có icon, nền và border đi cùng nhau.
- Mỗi bảng có header phân cấp, row zebra nhẹ, hover và vùng thao tác rõ ràng.

## 2. Typography

- Font: Plus Jakarta Sans, fallback Inter/system-ui.
- Heading page: 1.65–2.5rem, weight 800, letter-spacing -0.05em.
- Heading card: 1.05–1.35rem, weight 750–800.
- Body: 0.82–0.95rem, line-height 1.5–1.65.
- Label/caption: 0.66–0.78rem, dùng uppercase khi là eyebrow hoặc metadata.

## 3. Color tokens

### Dark

| Token | Value | Use |
|---|---|---|
| `--bg-dark` | `#08110D` | App background |
| `--surface-card` | `#102018` | Card, modal |
| `--surface-raised` | `#16291F` | Filter, metric tile |
| `--surface-input` | `#0D1A13` | Input/select |
| `--text-main` | `#EFF8F0` | Heading and primary text |
| `--text-muted` | `#A8B9AD` | Supporting text |
| `--accent-green` | `#B8F36A` | Primary action and active state |

### Light

| Token | Value | Use |
|---|---|---|
| `--bg-dark` | `#F2F6F1` | App background |
| `--surface-card` | `#FFFFFF` | Card, modal |
| `--surface-raised` | `#F4F9F4` | Filter, metric tile |
| `--surface-input` | `#FFFFFF` | Input/select |
| `--text-main` | `#14251B` | Heading and primary text |
| `--text-muted` | `#4F6255` | Supporting text |
| `--accent-green` | `#117A49` | Primary action and active state |

## 4. Components

- Button: radius 10px, primary button uses `--accent-green`, outline button uses `--border-color`.
- Card: radius 20px, 1px border, shared shadow token.
- Input/select: radius 10px, min-height 44px, focus ring from `--accent-green-glow`.
- Table: header surface, zebra rows, hover tint and actions grouped in `.admin-table-actions`.
- Status: use badge plus text; never rely on color alone.
- Notification: icon + colored surface + border + short text.
- Detail modal: backdrop blur, card surface, avatar, metrics and tags.

## 5. Theme rule

Components must reference semantic variables. A component may add a gradient for a hero or visual accent, but its text, border, form and status colors must continue to use the token set above. This keeps dark and light themes aligned without hardcoded colors leaking between them.
