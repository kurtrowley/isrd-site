# Systems Dynamics

*Foundation Track · Core Theory*

---

Systems Dynamics is a method for modeling and simulating the behavior of complex systems over time. Developed by Jay Forrester at MIT in the 1950s, it provides formal tools for translating the conceptual insights of systems thinking into quantitative models that can be tested, simulated, and communicated.

Where General Systems Theory provides vocabulary and Cybernetics provides principles, Systems Dynamics provides **method** — a rigorous way to build, test, and learn from dynamic models.

## The Core Modeling Language

Systems Dynamics models are built from four primitives:

**Stocks**
Accumulations — quantities that build up or drain away over time. Water in a tank. People in a population. Money in an account. Stress in a body. Stocks give systems their memory and inertia.

**Flows**
Rates of change in stocks. The tap filling the tank. Births and deaths in a population. Flows are always rates — quantities per unit of time.

**Feedback Loops**
Connections through which the state of a stock influences the flows that change it. The population of predators affects the rate at which prey is consumed, which affects the prey population, which affects predator reproduction. Feedback is what makes systems dynamic.

**Converters**
Auxiliary variables that compute relationships between stocks and flows. They encode the logic of the system.

## Causal Loop Diagrams

Before building a formal model, analysts draw **causal loop diagrams (CLDs)** — maps of the feedback structure of a system. Variables are connected by arrows labeled `+` (same direction) or `−` (opposite direction). Reinforcing loops (R) amplify change. Balancing loops (B) resist change.

A CLD of a simple predator-prey system:

```
Prey population → (+) → Predator reproduction → (+) → Predator population
Predator population → (+) → Predation rate → (-) → Prey population
```

Reading this: more prey → more predators → more predation → fewer prey. A classic balancing loop producing oscillation.

## Classic Models

**World3** (Limits to Growth, 1972) — modeled global population, industrialization, food production, and resource depletion. Predicted overshoot and collapse under business-as-usual scenarios — a finding that remains controversial and relevant.

**Bass Diffusion Model** — models the adoption of innovations through a reinforcing loop (word of mouth) and a balancing loop (market saturation). Used widely in marketing and technology forecasting.

**Epidemic Models (SIR)** — stock-and-flow models of disease spread. The COVID-19 pandemic made these models widely known.

## In Practice

Systems Dynamics is the most hands-on of the foundation theories — it produces working models, not just conceptual frameworks.

In practice, SD thinking shows up as:

- **Stock auditing** — before drawing any causal arrows, identify what is actually accumulating or depleting in the system. Stocks are where leverage lives. Flows can be changed relatively quickly; stocks change slowly and have inertia. Many "quick fixes" fail because they change flows without accounting for the stock dynamics that will undo the change.
- **Delay mapping** — explicitly identify where delays exist in a system's feedback structure. Long delays between action and consequence are the single most common cause of oscillation, overshoot, and management failure. Once you see the delays, you can anticipate the oscillation before it happens.
- **Causal loop sketching before modeling** — the discipline of drawing a causal loop diagram before quantifying anything forces explicit reasoning about structure. This alone is valuable, even without simulation.
- **Policy resistance analysis** — SD models are particularly good at showing why well-intentioned interventions fail. Often a policy that appears to address a problem actually triggers compensating feedback that undoes the change (the "fixes that fail" archetype). Mapping the full feedback structure before intervening reveals these traps.

For engineers and researchers working with systems that change over time — health systems, learning systems, organizational systems — SD provides the most formal and communicable way to represent what you know about system structure and to test your assumptions about behavior.

## Modules

*Modules in development.*

---

*Prerequisites: [General Systems Theory](/courses/gst-overview)*
*Recommended companion: [Complexity Science](/courses/complexity-science-overview)*
