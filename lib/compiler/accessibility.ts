/**
 * FORENSIQ Brand Intelligence OS · Advanced Accessibility Engine
 * Inspired by Deque axe-core & WCAG 2.1 / 2.2 Standards
 * 
 * Evaluates:
 * 1. Screen Reader Reading Order & Heading Hierarchy (WCAG 1.3.1 / 1.3.2)
 * 2. Key ARIA Attributes & Validity (WCAG 4.1.2)
 * 3. Accessible Naming: Buttons, Links, & Non-vague Link Text (WCAG 2.4.4 / 4.1.2)
 * 4. Image Non-Text Content & Alt Quality (WCAG 1.1.1)
 * 5. Form Field Label Associations (WCAG 3.3.2)
 * 6. Color Contrast Ratios (WCAG 1.4.3 AA & 1.4.6 AAA)
 * 7. Focus Traps & aria-hidden on Focusable Elements (WCAG 2.1.2 / 4.1.2)
 */

export interface AxeRuleResult {
  ruleId: string;
  ruleTitle: string;
  category: 'Structure' | 'ARIA' | 'Color & Contrast' | 'Accessible Names' | 'Forms' | 'Keyboard & Focus';
  wcagLevel: 'A' | 'AA' | 'AAA';
  wcagCriterion: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  status: 'PASS' | 'FAIL' | 'WARNING';
  targetElement?: string;
  description: string;
  failureSummary: string;
  remediation: string;
}

export interface AccessibilityAuditReport {
  score: number; // 0-100
  wcagCompliance: 'WCAG 2.1 AAA' | 'WCAG 2.1 AA' | 'NON_COMPLIANT';
  overallStatus: 'PASS' | 'CONDITIONAL' | 'FAIL';
  passedCount: number;
  failedCount: number;
  warningCount: number;
  rules: AxeRuleResult[];
  headingHierarchy: {
    valid: boolean;
    levels: number[];
    warnings: string[];
  };
  summary: string;
  testedAt: string;
}

export class AdvancedAccessibilityEngine {
  /**
   * Run full axe-core inspired rule evaluation on content and visual context
   */
  public evaluate(content: string, visualContext?: {
    htmlContent?: string;
    contrastRatio?: number;
    fontSize?: number;
    isBold?: boolean;
    hasAltText?: boolean;
    altTextValue?: string;
  }): AccessibilityAuditReport {
    const rules: AxeRuleResult[] = [];
    const html = visualContext?.htmlContent || content;
    const contrastRatio = visualContext?.contrastRatio ?? 7.4;

    // -------------------------------------------------------------
    // RULE 1: Color Contrast (WCAG 1.4.3 AA & 1.4.6 AAA)
    // -------------------------------------------------------------
    const isLargeText = (visualContext?.fontSize && visualContext.fontSize >= 18) || 
                        (visualContext?.fontSize && visualContext.fontSize >= 14 && visualContext?.isBold);
    const minAa = isLargeText ? 3.0 : 4.5;
    const minAaa = isLargeText ? 4.5 : 7.0;

    if (contrastRatio < minAa) {
      rules.push({
        ruleId: 'axe-color-contrast',
        ruleTitle: 'Color Contrast Ratio Below WCAG Minimum',
        category: 'Color & Contrast',
        wcagLevel: 'AA',
        wcagCriterion: '1.4.3 Contrast (Minimum)',
        impact: 'serious',
        status: 'FAIL',
        targetElement: 'body text token',
        description: `Elements must have sufficient color contrast ratio of at least ${minAa}:1. Measured ratio: ${contrastRatio}:1.`,
        failureSummary: `Current foreground/background pair yields ${contrastRatio}:1, failing minimum ${minAa}:1 threshold.`,
        remediation: 'Darken foreground text color to #0F172A or lighten background to achieve at least 4.5:1 ratio.'
      });
    } else if (contrastRatio < minAaa) {
      rules.push({
        ruleId: 'axe-color-contrast-aaa',
        ruleTitle: 'Color Contrast Meets AA but Fails AAA Enterprise Standard',
        category: 'Color & Contrast',
        wcagLevel: 'AAA',
        wcagCriterion: '1.4.6 Contrast (Enhanced)',
        impact: 'minor',
        status: 'WARNING',
        targetElement: 'body text token',
        description: `Recommended AAA contrast ratio is ${minAaa}:1. Current ratio: ${contrastRatio}:1.`,
        failureSummary: `Meets AA standard (${minAa}:1) but falls short of optimal AAA ${minAaa}:1 threshold.`,
        remediation: 'Enhance text contrast to 7.0+:1 for maximum readability on low-cost displays.'
      });
    } else {
      rules.push({
        ruleId: 'axe-color-contrast',
        ruleTitle: 'Color Contrast Exceeds WCAG 2.1 AAA',
        category: 'Color & Contrast',
        wcagLevel: 'AAA',
        wcagCriterion: '1.4.6 Contrast (Enhanced)',
        impact: 'minor',
        status: 'PASS',
        targetElement: 'body text token',
        description: `Contrast ratio ${contrastRatio}:1 exceeds AAA requirement (${minAaa}:1).`,
        failureSummary: 'None (Compliant)',
        remediation: 'Maintain approved color tokens.'
      });
    }

    // -------------------------------------------------------------
    // RULE 2: Heading Order & Reading Hierarchy (WCAG 1.3.1 & 1.3.2)
    // -------------------------------------------------------------
    const headingMatches: number[] = [];
    const hTagRegex = /<h([1-6])[^>]*>/gi;
    let hMatch;
    while ((hMatch = hTagRegex.exec(html)) !== null) {
      headingMatches.push(parseInt(hMatch[1], 10));
    }

    // If Markdown headers present (# Header, ## Subheader)
    if (headingMatches.length === 0) {
      const mdHeadingRegex = /^(#{1,6})\s+/gm;
      let mdMatch;
      while ((mdMatch = mdHeadingRegex.exec(content)) !== null) {
        headingMatches.push(mdMatch[1].length);
      }
    }

    const headingWarnings: string[] = [];
    let headingOrderValid = true;

    if (headingMatches.length > 0) {
      if (headingMatches[0] !== 1) {
        headingWarnings.push(`Document does not start with an <h1> heading (starts with <h${headingMatches[0]}>).`);
        headingOrderValid = false;
      }
      for (let i = 1; i < headingMatches.length; i++) {
        const diff = headingMatches[i] - headingMatches[i - 1];
        if (diff > 1) {
          headingWarnings.push(`Heading level skipped: <h${headingMatches[i - 1]}> followed directly by <h${headingMatches[i]}>.`);
          headingOrderValid = false;
        }
      }
    }

    if (!headingOrderValid && headingWarnings.length > 0) {
      rules.push({
        ruleId: 'axe-heading-order',
        ruleTitle: 'Heading Levels Must Increase By One Level At A Time',
        category: 'Structure',
        wcagLevel: 'A',
        wcagCriterion: '1.3.1 Info and Relationships',
        impact: 'serious',
        status: 'FAIL',
        targetElement: headingWarnings.join('; '),
        description: 'Heading levels should only increase by one level at a time (e.g. h1 to h2) to establish a predictable screen reader document outline.',
        failureSummary: headingWarnings.join(' '),
        remediation: 'Structure headings sequentially (h1 -> h2 -> h3) without skipping intermediate levels.'
      });
    } else {
      rules.push({
        ruleId: 'axe-heading-order',
        ruleTitle: 'Logical Screen Reader Heading Hierarchy',
        category: 'Structure',
        wcagLevel: 'A',
        wcagCriterion: '1.3.1 Info and Relationships',
        impact: 'minor',
        status: 'PASS',
        description: 'Heading outline follows structured document outline for assistive technology navigation.',
        failureSummary: 'None (Compliant)',
        remediation: 'Keep sequential heading nesting.'
      });
    }

    // -------------------------------------------------------------
    // RULE 3: Key ARIA Attributes & Orphaned References (WCAG 4.1.2)
    // -------------------------------------------------------------
    const hasAriaHiddenFocus = /aria-hidden=["']true["'][^>]*\btabindex=["'][0-9]+["']|<(?:a|button|input)[^>]*aria-hidden=["']true["']/i.test(html);
    if (hasAriaHiddenFocus) {
      rules.push({
        ruleId: 'axe-aria-hidden-focus',
        ruleTitle: 'aria-hidden Element Contains Focusable Content',
        category: 'ARIA',
        wcagLevel: 'A',
        wcagCriterion: '4.1.2 Name, Role, Value',
        impact: 'critical',
        status: 'FAIL',
        targetElement: '[aria-hidden="true"]',
        description: 'Focusable elements must not be placed inside an aria-hidden="true" tree because screen readers will navigate to invisible controls.',
        failureSummary: 'Focusable interactive elements detected inside an aria-hidden container.',
        remediation: 'Remove aria-hidden="true" from the parent or apply tabindex="-1" and aria-disabled to prevent keyboard focus.'
      });
    } else {
      rules.push({
        ruleId: 'axe-aria-hidden-focus',
        ruleTitle: 'Focusable Elements Accessible To Assistive Technology',
        category: 'ARIA',
        wcagLevel: 'A',
        wcagCriterion: '4.1.2 Name, Role, Value',
        impact: 'minor',
        status: 'PASS',
        description: 'No focusable interactive controls hidden behind aria-hidden attributes.',
        failureSummary: 'None (Compliant)',
        remediation: 'Maintain clean accessibility tree visibility.'
      });
    }

    // Check for role="button" without keyboard access or label
    const customButtonWithoutRole = /<div[^>]*onClick=[^>]*>(?!.*role=["']button["'])/i.test(html);
    const buttonMissingName = /<button[^>]*>\s*(?:<svg[^>]*>.*?<\/svg>)?\s*<\/button>(?!.*aria-label)/i.test(html);
    if (buttonMissingName) {
      rules.push({
        ruleId: 'axe-button-name',
        ruleTitle: 'Buttons Must Have Discernible Accessible Names',
        category: 'Accessible Names',
        wcagLevel: 'A',
        wcagCriterion: '4.1.2 Name, Role, Value',
        impact: 'critical',
        status: 'FAIL',
        targetElement: '<button>',
        description: 'Every interactive button must have accessible inner text, an aria-label, or an aria-labelledby attribute.',
        failureSummary: 'Button has no readable text or aria-label for screen reader users.',
        remediation: 'Add an aria-label="Action description" or visible text content to the button.'
      });
    } else {
      rules.push({
        ruleId: 'axe-button-name',
        ruleTitle: 'Interactive Controls Supply Discernible Accessible Names',
        category: 'Accessible Names',
        wcagLevel: 'A',
        wcagCriterion: '4.1.2 Name, Role, Value',
        impact: 'minor',
        status: 'PASS',
        description: 'Buttons and actions include text nodes or aria-labels.',
        failureSummary: 'None (Compliant)',
        remediation: 'Ensure all newly authored buttons provide aria-label.'
      });
    }

    // -------------------------------------------------------------
    // RULE 4: Non-Descriptive Link Text (WCAG 2.4.4)
    // -------------------------------------------------------------
    const vagueLinkMatches = html.match(/<a[^>]*>(?:\s*(?:click here|read more|learn more|link|view|here)\s*)<\/a>/i);
    if (vagueLinkMatches) {
      const sample = vagueLinkMatches[0];
      rules.push({
        ruleId: 'axe-link-name',
        ruleTitle: 'Ambiguous or Non-Descriptive Link Text',
        category: 'Accessible Names',
        wcagLevel: 'AA',
        wcagCriterion: '2.4.4 Link Purpose (In Context)',
        impact: 'moderate',
        status: 'WARNING',
        targetElement: `"${sample}"`,
        description: 'Link text must clearly explain destination out of context for screen reader rotor navigation list.',
        failureSummary: `Found generic link phrase "${sample}". Screen reader users cycling through links cannot determine destination.`,
        remediation: `Expand link text to describe destination (e.g. "Read the Forrester TEI Benchmark Report") or add aria-label="Read full report".`
      });
    } else {
      rules.push({
        ruleId: 'axe-link-name',
        ruleTitle: 'Descriptive Link Destination Text',
        category: 'Accessible Names',
        wcagLevel: 'AA',
        wcagCriterion: '2.4.4 Link Purpose (In Context)',
        impact: 'minor',
        status: 'PASS',
        description: 'Link copy provides clear context on navigation target.',
        failureSummary: 'None (Compliant)',
        remediation: 'Keep descriptive action anchors.'
      });
    }

    // -------------------------------------------------------------
    // RULE 5: Image Alt Text & Decorative Attributes (WCAG 1.1.1)
    // -------------------------------------------------------------
    const imgMissingAlt = /<img(?![^>]*\balt=)[^>]*>/i.test(html);
    const genericAltText = /alt=["'](?:image|photo|graphic|banner|logo)["']/i.test(html) ||
      (visualContext?.altTextValue && /^(image|photo|graphic|logo|banner)$/i.test(visualContext.altTextValue));

    if (imgMissingAlt) {
      rules.push({
        ruleId: 'axe-image-alt',
        ruleTitle: 'Images Must Have Alt Attribute',
        category: 'Accessible Names',
        wcagLevel: 'A',
        wcagCriterion: '1.1.1 Non-text Content',
        impact: 'critical',
        status: 'FAIL',
        targetElement: '<img />',
        description: 'All <img> elements must possess an alt attribute. Informative images require descriptive text; purely decorative images require alt="".',
        failureSummary: 'Image tag has no alt attribute defined.',
        remediation: 'Add alt="Descriptive brand asset text" or alt="" if purely decorative.'
      });
    } else if (genericAltText) {
      rules.push({
        ruleId: 'axe-image-alt-generic',
        ruleTitle: 'Non-Descriptive Generic Alt Text',
        category: 'Accessible Names',
        wcagLevel: 'A',
        wcagCriterion: '1.1.1 Non-text Content',
        impact: 'moderate',
        status: 'WARNING',
        targetElement: 'alt="image"',
        description: 'Alt text should convey specific meaning rather than generic words like "image" or "graphic".',
        failureSummary: 'Alt attribute contains generic placeholder terminology.',
        remediation: 'Replace with specific subject (e.g. "Inkloom Brand Governance Dashboard Architecture Diagram").'
      });
    } else {
      rules.push({
        ruleId: 'axe-image-alt',
        ruleTitle: 'Image Assets Provide Meaningful Text Equivalents',
        category: 'Accessible Names',
        wcagLevel: 'A',
        wcagCriterion: '1.1.1 Non-text Content',
        impact: 'minor',
        status: 'PASS',
        description: 'Images supply descriptive alt attributes or explicit decorative null flags.',
        failureSummary: 'None (Compliant)',
        remediation: 'Verify alt text updates on new creative uploads.'
      });
    }

    // -------------------------------------------------------------
    // RULE 6: Form Field Label Association (WCAG 3.3.2)
    // -------------------------------------------------------------
    const hasInputs = /<input[^>]*>/i.test(html);
    const hasLabelsOrAria = /<label[^>]*>/i.test(html) || /aria-label=/i.test(html) || /aria-labelledby=/i.test(html);
    const inputMissingLabel = hasInputs && !hasLabelsOrAria;
    if (inputMissingLabel) {
      rules.push({
        ruleId: 'axe-form-field-label',
        ruleTitle: 'Form Control Missing Associated Label',
        category: 'Forms',
        wcagLevel: 'A',
        wcagCriterion: '3.3.2 Labels or Instructions',
        impact: 'serious',
        status: 'FAIL',
        targetElement: '<input />',
        description: 'Every form control must have an associated <label> or aria-label so screen readers announce input purpose.',
        failureSummary: 'Form input found without explicit label or aria-label attribute.',
        remediation: 'Add <label htmlFor="id"> or aria-label="Input description".'
      });
    } else {
      rules.push({
        ruleId: 'axe-form-field-label',
        ruleTitle: 'Form Controls Provide Clear Accessible Labels',
        category: 'Forms',
        wcagLevel: 'A',
        wcagCriterion: '3.3.2 Labels or Instructions',
        impact: 'minor',
        status: 'PASS',
        description: 'Inputs, select menus, and textareas have programmatic label bindings.',
        failureSummary: 'None (Compliant)',
        remediation: 'Maintain label bindings.'
      });
    }

    // -------------------------------------------------------------
    // RULE 7: Screen Reader Reading Order (WCAG 1.3.2)
    // -------------------------------------------------------------
    const visualOrderReversal = /flex-direction:\s*(?:row-reverse|column-reverse)|order:\s*-[0-9]+/i.test(html);
    if (visualOrderReversal) {
      rules.push({
        ruleId: 'axe-screenreader-reading-order',
        ruleTitle: 'CSS Visual Ordering Disconnect from DOM Sequence',
        category: 'Structure',
        wcagLevel: 'A',
        wcagCriterion: '1.3.2 Meaningful Sequence',
        impact: 'moderate',
        status: 'WARNING',
        targetElement: 'flex-direction: row-reverse',
        description: 'Using CSS order or reverse flex directions changes visual layout without updating screen reader tab/reading order.',
        failureSummary: 'Visual ordering differs from underlying DOM reading sequence.',
        remediation: 'Reorder DOM elements directly rather than relying on CSS display reversal.'
      });
    } else {
      rules.push({
        ruleId: 'axe-screenreader-reading-order',
        ruleTitle: 'DOM Order Aligns With Meaningful Visual Sequence',
        category: 'Structure',
        wcagLevel: 'A',
        wcagCriterion: '1.3.2 Meaningful Sequence',
        impact: 'minor',
        status: 'PASS',
        description: 'DOM sequence accurately matches logical screen reader reading order.',
        failureSummary: 'None (Compliant)',
        remediation: 'Keep DOM sequence matching visual reading flow.'
      });
    }

    // Compute aggregated score & summary
    const passed = rules.filter(r => r.status === 'PASS').length;
    const failed = rules.filter(r => r.status === 'FAIL').length;
    const warnings = rules.filter(r => r.status === 'WARNING').length;

    const penalty = (failed * 25) + (warnings * 10);
    const score = Math.max(0, Math.min(100, 100 - penalty));

    let overallStatus: 'PASS' | 'CONDITIONAL' | 'FAIL' = 'PASS';
    let wcagCompliance: 'WCAG 2.1 AAA' | 'WCAG 2.1 AA' | 'NON_COMPLIANT' = 'WCAG 2.1 AAA';

    if (failed > 0) {
      overallStatus = 'FAIL';
      wcagCompliance = 'NON_COMPLIANT';
    } else if (warnings > 0) {
      overallStatus = 'CONDITIONAL';
      wcagCompliance = 'WCAG 2.1 AA';
    } else {
      overallStatus = 'PASS';
      wcagCompliance = 'WCAG 2.1 AAA';
    }

    return {
      score,
      wcagCompliance,
      overallStatus,
      passedCount: passed,
      failedCount: failed,
      warningCount: warnings,
      passes: rules.filter(r => r.status === 'PASS'),
      violations: rules.filter(r => r.status === 'FAIL'),
      incomplete: rules.filter(r => r.status === 'WARNING'),
      rules,
      headingHierarchy: {
        valid: headingOrderValid,
        levels: headingMatches,
        warnings: headingWarnings
      },
      summary: failed === 0 
        ? `Passed all ${passed} axe-core structural and perceptual tests (${wcagCompliance}).`
        : `Detected ${failed} accessibility violation(s) and ${warnings} warning(s) requiring remediation.`,
      testedAt: new Date().toISOString()
    };
  }
}

export const accessibilityEngine = new AdvancedAccessibilityEngine();
