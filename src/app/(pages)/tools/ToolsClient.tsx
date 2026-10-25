"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Calculator, ArrowRight, CheckCircle2, TrendingUp, Users, Mail, Loader2 } from 'lucide-react';

export default function ToolsClient() {
  const [employees, setEmployees] = useState(5);
  const [hoursWasted, setHoursWasted] = useState(10);
  const [hourlyWage, setHourlyWage] = useState(30);

  // Email modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const calculateOpportunity = () => {
    const weeklyValuePerEmp = hoursWasted * hourlyWage;
    const monthlyValuePerEmp = weeklyValuePerEmp * 4.33;
    const totalMonthlyOpportunity = monthlyValuePerEmp * employees;
    const totalAnnualOpportunity = totalMonthlyOpportunity * 12;
    const totalWeeklyHours = hoursWasted * employees;

    return {
      monthlyOpportunity: Math.round(totalMonthlyOpportunity),
      annualOpportunity: Math.round(totalAnnualOpportunity),
      totalWeeklyHours,
    };
  };

  const calculations = calculateOpportunity();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const handleReportRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      // Proxied server-side to the main site's /api/newsletter (n8n lead pipeline)
      await fetch('/api/tools-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          company,
          tags: ['calculator-lead', 'agency-lead', `team-${employees}`, `opportunity-${calculations.monthlyOpportunity}`],
          source: 'Workflow Opportunity Calculator',
        }),
      });

      setSubmitted(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitted(false);
        setEmail('');
        setCompany('');
      }, 4000);
    } catch (err) {
      console.error('Report request error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-foreground flex flex-col">
      {/* Hero Header */}
      <header className="relative pt-16 pb-16 px-6 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-semibold tracking-wider uppercase mb-4">
            <Calculator className="w-4 h-4" /> Workflow Planning Tool
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Estimate the Workflow Opportunity
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Estimate the manual hours and process time across your team that could be suitable for workflow automation and AI agent assistance.
          </p>
        </div>
      </header>

      <main id="main-content" role="main" className="max-w-7xl mx-auto px-6 py-16 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">

          {/* Input Controls */}
          <div className="lg:col-span-5 bg-card border border-border rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              Your Operations Inputs
            </h2>

            {/* Number of Employees */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Team Members / Staff</label>
                <span className="text-xl font-extrabold text-primary">{employees}</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={employees}
                onChange={(e) => setEmployees(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted accent-lime-500"
              />
            </div>

            {/* Hours Wasted per Employee */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Manual Hours / Member / Wk</label>
                <span className="text-xl font-extrabold text-primary">{hoursWasted} hrs</span>
              </div>
              <input
                type="range"
                min="1"
                max="40"
                value={hoursWasted}
                onChange={(e) => setHoursWasted(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted accent-lime-500"
              />
            </div>

            {/* Hourly Wage */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Estimated Hourly Labor Value</label>
                <span className="text-xl font-extrabold text-primary">${hourlyWage}/hr</span>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                value={hourlyWage}
                onChange={(e) => setHourlyWage(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted accent-lime-500"
              />
            </div>

            <div className="pt-4 border-t border-border text-xs text-muted-foreground leading-relaxed">
              * This calculator is an illustrative planning tool, not a revenue promise or financial guarantee. Actual operational improvements depend on workflow design, tool compatibility, and team adoption.
            </div>
          </div>

          {/* Results Output */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            <div className="bg-gradient-to-br from-primary/10 via-card to-card border border-primary/30 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div>
                <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider mb-4">
                  <TrendingUp className="w-4 h-4" /> Illustrative Workflow Opportunity
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div className="bg-background/80 p-6 rounded-2xl border border-border">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Monthly Labor Opportunity</div>
                    <div className="text-3xl sm:text-4xl font-extrabold">
                      {formatCurrency(calculations.monthlyOpportunity)}
                    </div>
                  </div>

                  <div className="bg-background/80 p-6 rounded-2xl border border-border">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Annual Labor Opportunity</div>
                    <div className="text-3xl sm:text-4xl font-extrabold text-primary">
                      {formatCurrency(calculations.annualOpportunity)}
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground text-base leading-relaxed mb-8">
                  Your team accumulates approximately <strong className="text-foreground">{calculations.totalWeeklyHours.toLocaleString()} manual hours</strong> every week across repetitive data handling, inquiry responses, and manual coordination.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-6 border-t border-border">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="https://sparkspheartechsolutions.com/contact"
                    className="flex-1 py-4 px-6 bg-primary text-primary-foreground rounded-xl font-extrabold text-center hover:opacity-90 transition-all shadow-lg shadow-primary/20 inline-flex items-center justify-center gap-2 text-base"
                  >
                    Book a Fit Call <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 py-4 px-6 border border-border bg-background/50 text-foreground rounded-xl font-bold hover:border-primary transition-all text-center inline-flex items-center justify-center gap-2 text-base cursor-pointer"
                  >
                    Get Operations Report <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Audit Next Steps */}
        <section className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm">
          <div className="max-w-3xl">
            <h3 className="text-2xl font-bold mb-4">How We Assess Your Workflow</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Our <strong className="text-foreground">Workflow Audit</strong> maps your operational processes, reviews existing software, and identifies specific automation opportunities before any agent is built.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="https://sparkspheartechsolutions.com/services/it-audits"
                className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
              >
                Learn More About the Workflow Audit <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Personalized Report Email Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <h3 className="text-2xl font-bold mb-2">
              Get Your Operations Summary
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              We will send your workflow evaluation summary and opportunity breakdown.
            </p>

            {submitted ? (
              <div className="p-6 bg-primary/10 border border-primary/30 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
                <p className="font-bold">Summary Sent!</p>
                <p className="text-xs text-muted-foreground">Check your inbox for your workflow opportunity summary.</p>
              </div>
            ) : (
              <form onSubmit={handleReportRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-muted-foreground mb-1">Company Name</label>
                  <input
                    type="text"
                    placeholder="Acme Operations"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-muted-foreground mb-1">Business Email</label>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 border border-border text-muted-foreground rounded-xl text-sm font-semibold hover:border-foreground/40 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Summary'}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight text-center mt-3">
                  © 2026 SPARKSPHEAR Tech Solutions. By submitting, you agree to our <Link href="https://sparkspheartechsolutions.com/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
