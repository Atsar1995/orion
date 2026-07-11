# ORION PLATFORM

# ORION Design System

---

## Version

1.0

---

## Status

Approved

---

## Owner

Mohammad Shafi Goroo  
Founder & CEO

Chief AI Architect & CTO

---

# Purpose

The ORION Design System defines the visual language, reusable UI components, design tokens, and user experience principles used throughout the ORION Platform.

Every ORION module—including ORANIA, ATSAR, CRM, Finance, Marketing, AI Intelligence, and future applications—must follow this Design System.

The objective is consistency, scalability, usability, accessibility, and a premium user experience.

---

# Design Philosophy

ORION follows five core principles.

## 1. Simplicity

Interfaces should be clean and uncluttered.

Every element must have a purpose.

---

## 2. Consistency

The same action should always look and behave the same.

Buttons, cards, inputs, spacing, and colors should never vary unnecessarily.

---

## 3. Clarity

Information should be easy to scan.

Users should immediately understand where to focus.

---

## 4. Performance

The interface should feel lightweight and responsive.

Avoid unnecessary visual effects or animations.

---

## 5. Business First

ORION exists to help business owners make decisions.

Every screen should reduce cognitive effort and increase productivity.

---

# Visual Identity

Professional

Elegant

Minimal

Modern

Premium

AI Assisted

Business Focused

---

# Color System

Primary Background

Near Black

Secondary Background

Dark Gray

Primary Surface

Charcoal

Primary Accent

ORION Gold

Primary Text

White

Secondary Text

Gray

Success

Green

Warning

Amber

Danger

Red

Information

Blue

---

# Typography

Primary Font

Geist

Fallback

System Sans

Heading

Bold

Body

Regular

Caption

Medium

Consistent typography must be used across every module.

---

# Spacing

Use an 8-point spacing system.

4

8

12

16

24

32

40

48

64

Avoid arbitrary spacing values.

---

# Border Radius

Small

Medium

Large

Extra Large

Pill

Use consistent rounded corners across all components.

---

# Shadows

Small

Medium

Large

Overlay

Shadows should remain subtle.

---

# Motion

Animations should be:

Fast

Purposeful

Consistent

Avoid decorative motion.

---

# Icons

Use a single icon library throughout the platform.

Icons should have:

Consistent size

Consistent stroke width

Consistent alignment

---

# Core Components

The ORION UI library includes reusable components such as:

Button

Card

Input

SearchBox

SectionHeader

StatCard

Divider

LoadingState

EmptyState

Future components:

Badge

Avatar

Dialog

Dropdown

Toast

Table

Pagination

Charts

Calendar

Date Picker

---

# Dashboard Principles

Mission Control is the visual reference for ORION.

Future dashboards should maintain:

Consistent spacing

Consistent cards

Consistent typography

Consistent navigation

Consistent information hierarchy

---

# Responsive Design

Desktop First

Tablet Optimized

Mobile Friendly

Every layout should adapt gracefully.

---

# Accessibility

Keyboard Navigation

Visible Focus Indicators

Semantic HTML

Accessible Labels

High Contrast Support

Readable Typography

---

# Design Tokens

Design tokens are the single source of truth.

They include:

Colors

Spacing

Typography

Radius

Shadows

Animation

Z-Index

Tokens are defined in:

```
lib/design-tokens.ts
```

---

# CSS Variables

Global CSS variables are defined in:

```
app/globals.css
```

Components should consume these variables rather than duplicate styling.

---

# Component Guidelines

Every reusable component should:

Be independent

Be reusable

Be documented

Use TypeScript

Support dark mode

Support accessibility

Avoid duplicated styling

---

# Naming Conventions

Components

PascalCase

Examples

Button

StatCard

SectionHeader

Files

PascalCase

Constants

camelCase

Types

PascalCase

---

# Future Enhancements

Light Theme

Theme Switching

Brand Customization

Advanced Charts

Animation Library

Enterprise Themes

Design Token Automation

---

# Governance

All UI changes must comply with this Design System.

Visual inconsistencies should be treated as engineering defects.

Future Engineering Specifications must reference this document.

---

# Related Documents

- ES-008 – ORION Design System Foundation
- ORION Constitution
- Component Inventory

---

Approved

Mohammad Shafi Goroo

Founder & CEO

ORION Platform

Chief AI Architect & CTO
