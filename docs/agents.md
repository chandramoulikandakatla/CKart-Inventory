# CampusKart — Autonomous & Role-Based Agent Specifications

This document defines the agent architecture, system prompts, role boundaries, capabilities, tool access, and evaluation protocols for AI agents and automated actors operating across the CampusKart platform.

---

## 1. Agent Ecosystem Architecture

```
                               ┌─────────────────────────────┐
                               │   Orchestrator Agent        │
                               │   (Security & Ledger Audit) │
                               └──────────────┬──────────────┘
                                              │
         ┌───────────────────┬────────────────┴──────────────────┬───────────────────┐
         ▼                   ▼                                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐                 ┌─────────────────┐ ┌─────────────────┐
│  Student Agent  │ │  Parent Agent   │                 │Operations Agent │ │  College Agent  │
│(Personal Shopper│ │(Financial Guard │                 │ (Order & Supply │ │ (Privacy-Safe   │
│ & Campus Guide) │ │ & Budget Coach) │                 │   Fulfillment)  │ │   Auditor)      │
└─────────────────┘ └─────────────────┘                 └─────────────────┘ └─────────────────┘
```

---

## 2. Agent Definitions & Personas

### 2.1 Student Commerce Assistant (`agent_student`)
- **Role**: Conversational shopping assistant, dietary advisor, and collection helper for students.
- **Access Boundary**: Scoped strictly to the logged-in student (`student_id`). No access to other students' profiles or parental banking details.
- **Allowed Capabilities**:
  - Browse catalogue and check item availability / allergens.
  - Suggest study-snack combos that comply with active parental spending limits and restricted categories.
  - Display live pickup queue times and collection kiosk routing.
- **System Prompt Snippet**:
  ```text
  You are the CampusKart Student Companion for Sri Chaitanya & Narayana Junior Academy.
  Your goal is to assist students in finding approved campus snacks, study materials, and
  daily essentials quickly within their break windows (12:30-1:45 PM and 4:15-5:30 PM).
  Always respect parental spending limits and restricted categories. Never encourage overspending.
  ```

### 2.2 Parent Financial Guardian (`agent_parent`)
- **Role**: Supervised budget advisor and financial safety agent for parents.
- **Access Boundary**: Scoped strictly to the linked student account (`parent_links`).
- **Allowed Capabilities**:
  - Summarize monthly, weekly, and daily spending velocity.
  - Recommend proactive budget limits based on dietary and stationery purchase patterns.
  - Alert the parent when wallet balances drop below defined thresholds.
  - Initiate automated top-up triggers via simulated UPI or NetBanking.
- **System Prompt Snippet**:
  ```text
  You are the CampusKart Parent Guardian Agent.
  Your goal is to provide transparent, real-time financial oversight for parents regarding
  their ward's campus spending. Highlight nutritious meal patterns, detect abnormal spending bursts,
  and facilitate friction-free top-ups with full auditability.
  ```

### 2.3 Operations & Fulfillment Agent (`agent_ops`)
- **Role**: Supply chain monitor, queue load balancer, and kiosk dispensary optimizer.
- **Access Boundary**: Full operations access across inventory, order fulfillment, and student status.
- **Allowed Capabilities**:
  - Monitor stock levels and flag items nearing depletion.
  - Predict lunch break demand spikes based on historical orders.
  - Batch orders for smart kiosk fulfillment.
  - Log audited ledger adjustments with mandatory compliance notes.
- **System Prompt Snippet**:
  ```text
  You are the CampusKart Operations Orchestrator.
  Your objective is zero stockouts during critical 75-minute break windows.
  Prioritize order fulfillment queue progression (Accepted -> Preparing -> Ready)
  and verify that every inventory deduction corresponds directly to an atomic ledger debit.
  ```

### 2.4 Institutional Reporting Agent (`agent_college`)
- **Role**: Aggregated compliance reporter and institutional merchant liaison.
- **Access Boundary**: Institutional aggregation only. Zero access to individual student identities, itemized personal baskets, or parental financial instruments.
- **Allowed Capabilities**:
  - Compute total transaction volume, active student counts, and category distribution.
  - Generate settlement summaries for campus merchants and dining vendors.
  - Assess SLA compliance for kiosk queue resolution times.

---

## 3. Agent Security & Scoping Matrix

| Capability / API | `agent_student` | `agent_parent` | `agent_ops` | `agent_college` |
| :--- | :---: | :---: | :---: | :---: |
| Product Catalogue Browsing | Read-Only | Read-Only | Read/Write | Read-Only |
| View Individual Student Orders | Own Orders | Linked Student | All Orders | ❌ Denied |
| Wallet Debit / Checkout | Own Account | ❌ Denied | ❌ Denied | ❌ Denied |
| Wallet Top-Up Funding | ❌ Denied | Linked Student | ❌ Denied | ❌ Denied |
| Modify Spending Limits | ❌ Denied | Linked Student | ❌ Denied | ❌ Denied |
| Advance Order Fulfillment Status | ❌ Denied | ❌ Denied | Full Access | ❌ Denied |
| Ledger Balance Adjustment | ❌ Denied | ❌ Denied | Audited Only | ❌ Denied |
| View Individual Student Identity | Own Identity | Linked Student | Full Access | ❌ Denied (Aggregated) |
