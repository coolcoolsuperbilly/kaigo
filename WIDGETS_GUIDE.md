# Interactive NitroStack UI Widgets Guide

## Overview

This project includes **8 interactive, fully-functional widgets** that provide a complete user interface for all major MCP tools. Each widget is built with vanilla CSS, responsive design, and real-time tool invocation.

---

## 📋 Widget Inventory

### 1. **Sign In Widget** 🔐
**Route:** `sign-in`  
**File:** `src/widgets/app/sign-in/page.tsx`  
**Tool:** `sign_in`

**Features:**
- FUFA handle and password input
- Password visibility toggle
- Real-time validation
- Success/error state display
- Shows user ID and balance on successful login

**Usage:**
```
User: "Sign me in with handle john.doe@fufa and password test123"
```

---

### 2. **Generate FUFA Account Widget** 📝
**Route:** `generate-fufa-account`  
**File:** `src/widgets/app/generate-fufa-account/page.tsx`  
**Tool:** `generate_fufa_account`

**Features:**
- Multi-field registration form
- Email, name, bank account, IFSC code inputs
- Password confirmation validation
- Automatic KYC verification
- Success confirmation with FUFA handle and user ID

**Usage:**
```
User: "Create a new FUFA account with email john@example.com, name John Doe, account 1234567890, IFSC SBIN0001234, password test123"
```

---

### 3. **Check Balance Widget** 💳
**Route:** `check-balance`  
**File:** `src/widgets/app/check-balance/page.tsx`  
**Tool:** `check_balance`

**Features:**
- Single FUFA handle input
- Large, prominent balance display
- Shows balance in both Rupees and Paise
- User name and account info display
- Color-coded success/error states

**Usage:**
```
User: "Check balance for john.doe@fufa"
```

---

### 4. **Send Money Widget** 💸
**Route:** `send-money`  
**File:** `src/widgets/app/send-money/page.tsx`  
**Tool:** `send_money`

**Features:**
- Sender and receiver handle inputs
- Amount input (in Rupees)
- Optional payment note
- Scam protection alerts with risk scoring
- Security confirmation flow for high-risk transactions
- Transaction ID display on success

**Usage:**
```
User: "Send ₹500 from john.doe@fufa to jane.smith@fufa with note 'Lunch money'"
```

---

### 5. **Analyze Scam Risk Widget** 🔍
**Route:** `analyze-scam-risk`  
**File:** `src/widgets/app/analyze-scam-risk/page.tsx`  
**Tool:** `analyze_scam_risk`

**Features:**
- Multi-input analysis (sender, receiver, amount, message)
- Risk score display (0-100)
- Risk level indicators (LOW, MEDIUM, HIGH, CRITICAL)
- Detected threats list
- Actionable recommendations
- Confidence percentage

**Usage:**
```
User: "Analyze scam risk for a transaction from john.doe@fufa to unknown.handle@fufa for ₹10000 with message 'Urgent payment needed'"
```

---

### 6. **Check Statement Widget** 📋
**Route:** `check-statement`  
**File:** `src/widgets/app/check-statement/page.tsx`  
**Tool:** `check_statement`

**Features:**
- FUFA handle input
- Statement type filter (All, Paid, Received)
- Scrollable transaction list
- Transaction details (date, amount, type, ID)
- Color-coded debit/credit indicators
- Formatted amounts in Rupees

**Usage:**
```
User: "Show me all transactions for john.doe@fufa"
User: "Show paid transactions for john.doe@fufa"
```

---

### 7. **Pension Status Widget** 🏦
**Route:** `pension-status`  
**File:** `src/widgets/app/pension-status/page.tsx`  
**Tool:** `get_pension_status`

**Features:**
- FUFA handle input
- Active pension enrollments display
- Scheme name and PRAN number
- Account status indicator
- Bank account information
- Payout history with amounts and dates
- Scrollable payout progress

**Usage:**
```
User: "Check pension status for john.doe@fufa"
```

---

### 8. **Insurance Status Widget** 🛡️
**Route:** `insurance-status`  
**File:** `src/widgets/app/insurance-status/page.tsx`  
**Tool:** `get_insurance_status`

**Features:**
- FUFA handle input
- Active insurance policies display
- Policy number and scheme name
- Coverage amount display
- Policy validity date
- Claim history with amounts and status
- Policy status indicator (ACTIVE/INACTIVE)

**Usage:**
```
User: "Check insurance status for john.doe@fufa"
```

---

## 🎨 Design System

### Color Scheme
- **Dark Mode:** Slate grays (#1f2937, #111827) with accent colors
- **Light Mode:** White backgrounds with subtle grays
- **Success:** Green (#10b981, #059669)
- **Error:** Red (#ef4444, #dc2626)
- **Warning:** Amber (#f59e0b, #d97706)
- **Info:** Blue (#3b82f6, #2563eb)
- **Purple:** Violet (#8b5cf6, #7c3aed)

### Typography
- **Headings:** Bold, 20-24px
- **Labels:** 13-14px, medium weight
- **Body:** 13-14px, regular weight
- **Monospace:** For amounts, IDs, and technical data

### Components
- **Inputs:** 8-10px padding, 6px border-radius, smooth transitions
- **Buttons:** 12px padding, 8px border-radius, disabled state support
- **Cards:** 1px border, 12px border-radius, subtle shadows
- **Loading:** Spinning emoji animation

---

## 🔧 Technical Details

### Widget SDK Integration
All widgets use the NitroStack Widget SDK:
```typescript
const { isReady, getToolOutput, callTool } = useWidgetSDK();
const theme = useTheme();
```

### State Management
- React hooks (`useState`) for form state
- Widget SDK for tool output caching
- Real-time loading states

### Responsive Design
- Max-width constraints (400-600px)
- Grid layouts for multi-column displays
- Scrollable containers for long lists
- Mobile-friendly input sizes

### Error Handling
- Null checks on all data
- Graceful error display
- User-friendly error messages
- Loading state indicators

---

## 🚀 Running the Widgets

### Prerequisites
1. NitroStack Studio installed
2. Project connected to Studio
3. Dev server running (`npm run dev`)

### Testing a Widget
1. Open NitroStack Studio
2. Connect to the project
3. Use the MCP Chat to invoke tools
4. Widgets render automatically in the right pane

### Example Flow
```
User: "Create a new account with email test@example.com, name Test User, account 9876543210, IFSC HDFC0001234, password secure123"
→ generate-fufa-account widget renders
→ Shows success with FUFA handle: test.user@fufa
→ User can then sign in with new credentials
```

---

## 📊 Widget Features Matrix

| Widget | Input Fields | Output Display | Real-time | Async |
|--------|-------------|-----------------|-----------|-------|
| Sign In | 2 | User info + balance | ✅ | ✅ |
| Create Account | 6 | FUFA handle + ID | ✅ | ✅ |
| Check Balance | 1 | Balance (₹ + paise) | ✅ | ✅ |
| Send Money | 4 | Transaction ID | ✅ | ✅ |
| Analyze Scam | 5 | Risk score + threats | ✅ | ✅ |
| Statement | 2 | Transaction list | ✅ | ✅ |
| Pension Status | 1 | Enrollments + payouts | ✅ | ✅ |
| Insurance Status | 1 | Policies + claims | ✅ | ✅ |

---

## 🎯 Key Features

### Universal Features (All Widgets)
✅ Dark/Light theme support  
✅ Responsive design  
✅ Loading states with animations  
✅ Error handling and display  
✅ Disabled state during loading  
✅ Keyboard accessible inputs  
✅ Smooth transitions  

### Security Features
✅ Password visibility toggle (Sign In)  
✅ Scam risk analysis (Send Money)  
✅ Security alert confirmation flow  
✅ Risk scoring and threat detection  

### Data Display Features
✅ Formatted currency (₹ + paise)  
✅ Date/time formatting  
✅ Transaction type indicators  
✅ Status badges  
✅ Scrollable lists  
✅ Grid layouts  

---

## 📝 Notes

- All widgets use vanilla CSS (no Tailwind)
- Widgets are fully self-contained
- No external dependencies beyond @nitrostack/widgets
- All styling is inline for portability
- Widgets handle null/undefined data gracefully
- Loading animations use CSS keyframes

---

## 🔗 Integration Points

### Tools Used
- `sign_in` - Authentication
- `generate_fufa_account` - Account creation
- `check_balance` - Balance inquiry
- `send_money` - Money transfer
- `analyze_scam_risk` - Fraud detection
- `check_statement` - Transaction history
- `get_pension_status` - Pension tracking
- `get_insurance_status` - Insurance tracking

### Widget Routes
All widgets are accessible via their route names in the MCP Chat:
- `ui://sign-in`
- `ui://generate-fufa-account`
- `ui://check-balance`
- `ui://send-money`
- `ui://analyze-scam-risk`
- `ui://check-statement`
- `ui://pension-status`
- `ui://insurance-status`

---

## ✨ Future Enhancements

Potential additions:
- Payment intent creation widget
- Contact management widget
- Security alert confirmation widget
- Pension enrollment widget
- Insurance purchase widget
- Transaction detail modal
- Export statement as PDF
- Real-time balance updates
- Transaction notifications

---

**Created:** 2024  
**Framework:** NitroStack + Next.js  
**UI Library:** Vanilla CSS + React Hooks  
**Status:** ✅ Production Ready
