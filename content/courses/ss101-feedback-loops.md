# Feedback Loops

*Systems Science 101 — Core Concepts*

---

A **feedback loop** exists when the output of a system influences its own input. This circular causality is the defining feature of dynamic systems and the primary reason system behavior is so often counterintuitive.

Most human reasoning is linear: A causes B, B causes C, C causes D. Feedback thinking is circular: A causes B, which loops back and changes A. The loop changes everything.

## Two Types of Feedback

All feedback loops are either **reinforcing** or **balancing**.

### Reinforcing Loops (Positive Feedback)

A reinforcing loop amplifies change in the same direction. More produces more; less produces less. The name "positive feedback" refers to the direction of effect, not its value — positive feedback can drive a system toward catastrophe just as easily as toward growth.

Classic reinforcing loops:

- **Compound interest** — money earns interest, which adds to principal, which earns more interest
- **Population growth** — more people → more births → more people
- **Word of mouth** — more users → more referrals → more users
- **Erosion** — soil loss → less vegetation → more erosion
- **Panic selling** — falling prices → fear → more selling → lower prices

Reinforcing loops always produce exponential change — growth curves or collapse curves. Left unchecked, they run to limits.

**Notation:** Reinforcing loops are labeled **R** in causal diagrams. Every link in the loop has a consistent direction: all positive (same direction as cause), or an even number of negative links.

### Balancing Loops (Negative Feedback)

A balancing loop resists change and seeks equilibrium. It compares a current state to a goal and acts to close the gap. All goal-seeking behavior is driven by balancing loops.

Classic balancing loops:

- **Thermostat** — actual temperature → gap from setpoint → heating/cooling → actual temperature
- **Homeostasis** — blood glucose → insulin response → blood glucose
- **Inventory management** — stock level → reorder trigger → deliveries → stock level
- **Predator-prey** — prey population → predator reproduction → predation → prey population
- **Interest rate policy** — inflation → rate adjustment → borrowing costs → economic activity → inflation

Balancing loops produce stability — or oscillation, if there is significant delay between sensing the gap and acting on it.

**Notation:** Balancing loops are labeled **B** in causal diagrams. They contain an odd number of negative links (links where the effect moves opposite to the cause).

## Reading the Arrows

In a causal loop diagram, each arrow is labeled **+** or **−**:

- **+** (same direction): when the cause increases, the effect increases; when the cause decreases, the effect decreases
- **−** (opposite direction): when the cause increases, the effect decreases; when the cause decreases, the effect increases

*Example: predator-prey*

```
Prey population →(+)→ Predator births →(+)→ Predator population
Predator population →(+)→ Predation rate →(−)→ Prey population
```

Count the negative links around the loop: one (the predation rate → prey link). Odd number → balancing loop. This loop produces oscillation — classic predator-prey cycles.

## Why Feedback Matters

**Systems don't behave the way we push them.** In a linear world, more effort produces more result. In a feedback world, the system responds to your intervention in ways that can amplify, dampen, or reverse your intended effect.

**Delays make feedback dangerous.** If there is a long lag between cause and effect, actors respond to outdated information. They overshoot and then overcorrect. The result is oscillation — and sometimes collapse.

**High-leverage points are often in the feedback structure.** Changing a parameter (a price, a rate, a quantity) rarely changes system behavior fundamentally. Changing the feedback structure — adding a new loop, removing a delay, shifting a goal — can change everything.

## Feedback and Information

From an information systems perspective, feedback loops are **signal processing architectures**. Every loop carries information about a system's state and uses that information to modulate its own behavior.

This framing reveals several things that the standard control-systems view underemphasizes:

- **What the system measures** is as important as what it does with the measurement. A sensor that measures the wrong variable — or measures the right variable with too much delay — produces a feedback loop that regulates the wrong thing, or regulates too slowly to be effective.
- **What the system ignores** is equally important. Every feedback loop is selective. It responds to some signals and filters out others. The design of this selectivity determines what the system is actually managing.
- **Attractor states** are defined by feedback structure. A balancing loop with a fixed goal defines a fixed-point attractor — the system will return to that point after perturbation. Multiple interacting loops define a richer attractor landscape: stable points, cycles, and in complex cases, strange attractors. The feedback structure *is* the attractor structure.

This is why understanding feedback loops is not just about tracing causal arrows — it is about understanding what information the system is using, what it is optimizing for, and where it will naturally settle.

## Feedback in Practice

Recognizing feedback loops in real systems:

1. **Identify the key stocks** — what is accumulating or depleting?
2. **Ask what drives the flows** — what controls how fast the stock changes?
3. **Trace the influence back** — does the stock itself influence the flows? Through what path?
4. **Identify the goal** (for balancing loops) — what state is the loop trying to achieve?
5. **Find the delays** — how much lag separates cause from effect?

A system with multiple interacting feedback loops — some reinforcing, some balancing, with varying delays — can produce any behavior: growth, oscillation, collapse, S-curves, or chaotic fluctuation. The behavior is in the structure.

---

*Part of the [Systems Science 101](/courses/ss101-what-is-systems-science) reference.*
*See also: [Emergence](/courses/ss101-emergence) · [What Is Systems Science?](/courses/ss101-what-is-systems-science)*
*Deep dive: [Systems Dynamics course](/courses/systems-dynamics-overview)*
