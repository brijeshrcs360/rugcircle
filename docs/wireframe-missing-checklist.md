# Rug Circle Wireframe - Missing Items Checklist

Date: 2026-04-29
Scope: Gap list between current implementation and `Rug Circle - Registration Process Wireframes.docx`

## Frontend Flow Gaps
- [ ] Build dedicated 5-step registration flow:
  - [ ] Screen 1: Campaign Landing Page (title, description, date, time, location, price, highlights)
  - [ ] Screen 2: Registration Form (first name, last name, email, mobile, optional address)
  - [ ] Screen 3: Payment Page (dynamic HDFC Vyapar UPI QR)
  - [ ] Screen 4: Rug Design Selection (grid, selection highlight, optional difficulty/size)
  - [ ] Screen 5: Confirmation (participant + campaign + payment + design summary)

## Payment Integration Gaps
- [ ] Generate dynamic UPI QR from HDFC Vyapar per registration session
- [ ] Link QR amount to campaign fee
- [ ] Add automatic payment status polling (every 5-10s)
- [ ] Add webhook listener and update registration state on payment confirmation
- [ ] Add QR expiry timer (example 15 min)
- [ ] Add loading + success states around payment confirmation

## Data Model / Fields Gaps
- [ ] Ensure registration schema includes wireframe fields:
  - [ ] first_name
  - [ ] last_name
  - [ ] email
  - [ ] mobile
  - [ ] address (optional)
- [ ] Preserve selected rug design on registration record
- [ ] Preserve HDFC reference IDs and transaction metadata

## Campaign Management Gaps (Admin)
- [ ] Campaign `description` field in editor UI
- [ ] HDFC Vyapar configuration section in editor UI
- [ ] Rug design options manager in editor UI (add/edit/remove)
- [ ] Campaign duplicate action in campaigns list
- [ ] Activate/deactivate action semantics aligned with wireframe wording

## Registration Management Gaps (Admin)
- [ ] Excel export (`.xlsx`) in addition to CSV
- [ ] Registration detail page edit actions (status/update fields) if required
- [ ] Optional: add payment event raw payload inspect panel

## UX / Visual Gaps
- [ ] Ensure mobile-first step layout for new registration flow
- [ ] Add clear payment instructions text exactly as wireframe intent
- [ ] Keep large touch targets for key actions
- [ ] Keep style aligned with handmade workshop tone

## Route / IA Gaps
- [ ] Add dedicated public registration routes separate from corporate package flow
- [ ] Ensure campaign landing routes map 1:1 to active campaign slugs

## Validation / QA Gaps
- [ ] End-to-end happy path test (register -> pay confirmed -> design -> confirmation)
- [ ] Failed/expired payment scenarios
- [ ] Campaign closed/inactive behavior in frontend
- [ ] Regression test on current admin sections after new module integration
