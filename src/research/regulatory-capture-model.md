# Regulatory Capture: How Closed Feedback Loops Get Stuck

**Kurt Rowley**
Methodology | Bio-Systemics · Complex Disease Modeling

---

A separate research thread of mine — a hypothesis paper on a proposed mechanism for a subset of ME/CFS, respiratory pacemaker network disruption (RPND) — makes a claim that is, underneath the physiology, a systems-science claim before it is a medical one: that a closed regulatory feedback loop can settle into two different stable states, that the pressure needed to enter the unhealthy state is lower than the pressure needed to leave it, and that once latched, the state can outlast the trigger that caused it by a wide margin. This note sets that architecture aside from its medical specifics and shows it for what it structurally is — the same pattern already illustrated elsewhere on this site through flocking birds and the Lorenz attractor, applied here to a real, falsifiable disease hypothesis.

## The hypothesis, briefly

The RPND paper proposes that in a subset of ME/CFS patients, the cortex and limbic system exert sustained override of the brainstem's respiratory pacemaker (the preBötzinger complex) — a structure normally granted only brief, voluntary control for speech or effort. Sustained override produces chronic mild hypocapnia (low CO₂), which impairs tissue oxygen delivery through two independent routes, triggering a protective cellular shutdown under exertion — the pattern patients experience as post-exertional malaise. Every individual component of that chain is independently established physiology; the paper's claim is architectural, not biochemical: that assembling known pieces into a closed loop, rather than a one-way chain, explains why the state persists.

That last clause is the systems-science claim, and it is worth pulling apart on its own terms.

## Three patterns, one architecture

**Emergence.** The site's Emergence / Flocking demonstration shows a flock's coherent motion arising from three simple local rules — no bird sees or controls the global pattern. Neural populations work the same way structurally: no single neuron "decides" to override automatic breathing. A sustained override state is a collective property of many coupled units — cortical, limbic, and brainstem circuits entraining each other — the same way flocking is a collective property of many coupled birds. This isn't a metaphor grafted onto neuroscience after the fact; cortical and limbic circuits are, mathematically, coupled nonlinear oscillator networks, which is the same class of system a flocking model is a simplified instance of.

**Feedback loops.** The RPND paper documents an anatomically confirmed, bidirectional connection between the amygdala and the respiratory pacemaker — an inhibitory projection running one direction, a regulatory projection running the other. That is a closed loop, not a one-way causal chain, and the site's Feedback Loops demonstration shows what closed loops do that open chains don't: with enough gain, a reinforcing loop stops being proportional to its input and starts sustaining itself. The paper's account of why the illness state persists after its trigger resolves is exactly this — a loop whose own downstream output (a threat-adjacent physiological state) feeds back to maintain the cortical/limbic drive that caused it in the first place.

**Sensitive dependence and bistability.** The Lorenz Attractor demonstration shows a deterministic system with two stable regions and a threshold between them — a trajectory can sit in one lobe indefinitely, then a small perturbation pushes it into the other, after which it settles into a qualitatively different, equally stable pattern. This is precisely the structure the RPND paper proposes for illness onset: several mechanistically unrelated pressures — infection, chronic threat state, structural injury, environmental exposure — can each independently push a bistable cortex–brainstem loop across its threshold, none of them individually necessary, all of them capable of producing the same downstream latch. It is also why the paper does not predict a single sufficient cause, and why that absence has not been a defect in four decades of otherwise rigorous single-pathway ME/CFS research — it is what a regulatory-capture architecture, correctly modeled, should be expected to produce.

## Why neural systems are expected to behave this way

None of this requires treating the nervous system as *like* a complex system for illustrative convenience. It is one: large numbers of coupled units, governed by local interaction rules and feedback loops rather than central control, capable of multiple stable operating states, and sensitive to small perturbations near a threshold. Complex disease phenotypes that resist a single-pathway explanation — variable, patient-specific, seemingly disproportionate to their trigger — are the expected signature of a *regulatory* failure in a system built this way, not evidence against a unifying mechanism. That is the organizing claim of the source paper's introduction, and it is the reason this note treats the medical hypothesis as a legitimate object for the same systems-science toolkit already used for flocking, feedback, and chaos on this site.

## Two demonstrations

**[The Latched Loop](/simulations/regulatory-capture)** models the causal chain directly — pressure, cortical/limbic override, hypocapnia, tissue oxygen deficit, and the Cell Danger Response, closed by the reinforcing feedback edge described above, with a cluster of downstream systems (cardiac rhythm, sleep, gut motility, cognition) entrained by the same upstream state. Drag the pressure slider up and the system snaps from a "Regulated" basin into a "Captured" one at one threshold; drag it back down and it does not revert until a lower threshold — the hysteresis gap is the demonstration's central point.

**The Privileged Node** *(in development)* sets the dynamics aside and asks a structural question instead: the body runs on several biological pacemakers, and three of them are entrained peers. The respiratory pacemaker alone has a voluntary override door, a body-wide diffusible output, and a direct limbic connection the others lack — this demonstration will show why that specific asymmetry, not breathing generally, is the node a systemic failure would be expected to route through.

## What this is, and isn't

This note and its demonstrations illustrate an architecture, not a confirmed mechanism. The source hypothesis is explicit about which of its claims are established physiology, which are proposed extensions consistent with that physiology, and which are speculative — and makes no claim to have been clinically tested. What the systems-science framing adds is independent of that clinical question: *if* a closed loop of this shape exists, bistability and hysteresis are not a special or unusual property to expect of it — they are the default behavior of that class of system, the same as they are for a flock, a feedback graph, or a Lorenz attractor.
