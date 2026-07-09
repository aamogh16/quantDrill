import { useState } from 'react'
import { TopBar } from '../components/TopBar'
import { Toggle } from '../components/Toggle'
import { Stepper } from '../components/Stepper'
import { MODES } from '../lib/modes'
import { clearHistory, DEFAULT_SETTINGS, getSettings, updateSettings } from '../lib/storage'
import type { Settings as SettingsType } from '../types'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 gap-3">
      <span className="text-sm text-term-text">{label}</span>
      {children}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-term-panel border border-term-border rounded-lg px-4 py-2 divide-y divide-term-border">
      <div className="py-2 text-xs uppercase tracking-wide text-term-dim font-semibold">{title}</div>
      {children}
    </div>
  )
}

export function Settings() {
  const [settings, setSettings] = useState<SettingsType>(() => getSettings())

  const patch = (p: Partial<SettingsType>) => setSettings(updateSettings(p))

  const resetAll = () => {
    setSettings(updateSettings(DEFAULT_SETTINGS))
  }

  return (
    <>
      <TopBar title="Settings" />
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 pb-10">
        <Section title="Active Modes">
          {MODES.map((mode) => (
            <Row key={mode.id} label={mode.name}>
              <Toggle
                checked={settings.enabledModes[mode.id]}
                onChange={(v) => patch({ enabledModes: { ...settings.enabledModes, [mode.id]: v } })}
              />
            </Row>
          ))}
        </Section>

        <Section title="Arithmetic Sprints">
          <Row label="Addition">
            <Toggle
              checked={settings.arithmetic.ops.add}
              onChange={(v) => patch({ arithmetic: { ...settings.arithmetic, ops: { ...settings.arithmetic.ops, add: v } } })}
            />
          </Row>
          <Row label="Subtraction">
            <Toggle
              checked={settings.arithmetic.ops.sub}
              onChange={(v) => patch({ arithmetic: { ...settings.arithmetic, ops: { ...settings.arithmetic.ops, sub: v } } })}
            />
          </Row>
          <Row label="Multiplication">
            <Toggle
              checked={settings.arithmetic.ops.mul}
              onChange={(v) => patch({ arithmetic: { ...settings.arithmetic, ops: { ...settings.arithmetic.ops, mul: v } } })}
            />
          </Row>
          <Row label="Division">
            <Toggle
              checked={settings.arithmetic.ops.div}
              onChange={(v) => patch({ arithmetic: { ...settings.arithmetic, ops: { ...settings.arithmetic.ops, div: v } } })}
            />
          </Row>
          <Row label="Min digits">
            <Stepper
              value={settings.arithmetic.digits.min}
              min={1}
              max={settings.arithmetic.digits.max}
              onChange={(v) => patch({ arithmetic: { ...settings.arithmetic, digits: { ...settings.arithmetic.digits, min: v } } })}
            />
          </Row>
          <Row label="Max digits">
            <Stepper
              value={settings.arithmetic.digits.max}
              min={settings.arithmetic.digits.min}
              max={4}
              onChange={(v) => patch({ arithmetic: { ...settings.arithmetic, digits: { ...settings.arithmetic.digits, max: v } } })}
            />
          </Row>
          <Row label="Decimals">
            <Toggle
              checked={settings.arithmetic.decimals}
              onChange={(v) => patch({ arithmetic: { ...settings.arithmetic, decimals: v } })}
            />
          </Row>
          <Row label="Fractions">
            <Toggle
              checked={settings.arithmetic.fractions}
              onChange={(v) => patch({ arithmetic: { ...settings.arithmetic, fractions: v } })}
            />
          </Row>
          <Row label="Round length (s)">
            <Stepper
              value={settings.arithmetic.roundSeconds}
              min={30}
              max={180}
              step={15}
              onChange={(v) => patch({ arithmetic: { ...settings.arithmetic, roundSeconds: v } })}
            />
          </Row>
        </Section>

        <Section title="Percentage & Fraction">
          <Row label="Fraction conversions">
            <Toggle
              checked={settings.percent.includeFractions}
              onChange={(v) => patch({ percent: { ...settings.percent, includeFractions: v } })}
            />
          </Row>
          <Row label="Chained % change">
            <Toggle
              checked={settings.percent.includeChained}
              onChange={(v) => patch({ percent: { ...settings.percent, includeChained: v } })}
            />
          </Row>
          <Row label="Round length (s)">
            <Stepper
              value={settings.percent.roundSeconds}
              min={30}
              max={180}
              step={15}
              onChange={(v) => patch({ percent: { ...settings.percent, roundSeconds: v } })}
            />
          </Row>
        </Section>

        <Section title="Mental Multiplication">
          <Row label="2x2 digit products">
            <Toggle
              checked={settings.multiplication.twoByTwo}
              onChange={(v) => patch({ multiplication: { ...settings.multiplication, twoByTwo: v } })}
            />
          </Row>
          <Row label="Squares to 30">
            <Toggle
              checked={settings.multiplication.squares}
              onChange={(v) => patch({ multiplication: { ...settings.multiplication, squares: v } })}
            />
          </Row>
          <Row label="Doubling/halving chains">
            <Toggle
              checked={settings.multiplication.doublingChains}
              onChange={(v) => patch({ multiplication: { ...settings.multiplication, doublingChains: v } })}
            />
          </Row>
          <Row label="Round length (s)">
            <Stepper
              value={settings.multiplication.roundSeconds}
              min={30}
              max={180}
              step={15}
              onChange={(v) => patch({ multiplication: { ...settings.multiplication, roundSeconds: v } })}
            />
          </Row>
        </Section>

        <Section title="Fermi Estimation">
          <Row label="Seconds per question">
            <Stepper
              value={settings.fermi.secondsPerQuestion}
              min={15}
              max={120}
              step={5}
              onChange={(v) => patch({ fermi: { ...settings.fermi, secondsPerQuestion: v } })}
            />
          </Row>
          <Row label="Questions per session">
            <Stepper
              value={settings.fermi.questionsPerSession}
              min={3}
              max={15}
              onChange={(v) => patch({ fermi: { ...settings.fermi, questionsPerSession: v } })}
            />
          </Row>
        </Section>

        <Section title="Sequence & Pattern">
          <Row label="Include trap sequences">
            <Toggle
              checked={settings.sequence.includeTraps}
              onChange={(v) => patch({ sequence: { ...settings.sequence, includeTraps: v } })}
            />
          </Row>
          <Row label="Round length (s)">
            <Stepper
              value={settings.sequence.roundSeconds}
              min={30}
              max={180}
              step={15}
              onChange={(v) => patch({ sequence: { ...settings.sequence, roundSeconds: v } })}
            />
          </Row>
        </Section>

        <Section title="EV Card Market">
          <Row label="Deck size">
            <Stepper
              value={settings.evMarket.deckSize}
              min={20}
              max={52}
              step={4}
              onChange={(v) => patch({ evMarket: { ...settings.evMarket, deckSize: v } })}
            />
          </Row>
          <Row label="Hidden cards">
            <Stepper
              value={settings.evMarket.hiddenCards}
              min={1}
              max={6}
              onChange={(v) => patch({ evMarket: { ...settings.evMarket, hiddenCards: v } })}
            />
          </Row>
          <Row label="Quote skew">
            <Stepper
              value={settings.evMarket.skew}
              min={0.5}
              max={5}
              step={0.5}
              onChange={(v) => patch({ evMarket: { ...settings.evMarket, skew: v } })}
            />
          </Row>
          <Row label="Seconds per decision">
            <Stepper
              value={settings.evMarket.secondsPerDecision}
              min={5}
              max={60}
              step={5}
              onChange={(v) => patch({ evMarket: { ...settings.evMarket, secondsPerDecision: v } })}
            />
          </Row>
          <Row label="Sub-mode">
            <div className="flex gap-1.5">
              {(['taking', 'making', 'mixed'] as const).map((sm) => (
                <button
                  key={sm}
                  onClick={() => patch({ evMarket: { ...settings.evMarket, subMode: sm } })}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                    settings.evMarket.subMode === sm
                      ? 'bg-term-accent text-term-bg border-term-accent'
                      : 'bg-term-panel-2 text-term-dim border-term-border'
                  }`}
                >
                  {sm}
                </button>
              ))}
            </div>
          </Row>
        </Section>

        <Section title="ETF Arbitrage">
          <Row label="Seconds per round">
            <Stepper
              value={settings.etfArb.secondsPerRound}
              min={15}
              max={120}
              step={5}
              onChange={(v) => patch({ etfArb: { ...settings.etfArb, secondsPerRound: v } })}
            />
          </Row>
          <Row label="Underlying legs">
            <Stepper
              value={settings.etfArb.legs}
              min={2}
              max={4}
              onChange={(v) => patch({ etfArb: { ...settings.etfArb, legs: v } })}
            />
          </Row>
        </Section>

        <Section title="Data">
          <Row label="Clear session history">
            <button
              onClick={() => {
                if (confirm('Clear all session history? This cannot be undone.')) clearHistory()
              }}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-term-red-dim text-term-red border border-term-red/40"
            >
              Clear
            </button>
          </Row>
          <Row label="Reset settings to defaults">
            <button
              onClick={resetAll}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-term-panel-2 text-term-dim border border-term-border"
            >
              Reset
            </button>
          </Row>
        </Section>
      </div>
    </>
  )
}
