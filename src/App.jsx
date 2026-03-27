
import React, { useMemo, useRef, useState } from "react";

const TOTAL_QUESTIONS = 35;
const CYCLES = 7;
const LETTERS = ["A", "B", "C", "D", "E"];

const cycleOrder = {
  1: [1, 7, 8, 22, 19],
  2: [31, 33, 34, 35, 13],
  3: [4, 9, 12, 18, 32],
  4: [2, 14, 17, 30, 15],
  5: [10, 11, 5, 26, 27],
  6: [3, 20, 23, 24, 28],
  7: [6, 21, 25, 29, 16],
};

const correct = {
  1: "B", 7: "C", 8: "A", 22: "B", 19: "C",
  31: "C", 33: "D", 34: "B", 35: "C", 13: "A",
  4: "C", 9: "B", 12: "D", 18: "B", 32: "C",
  2: "C", 14: "B", 17: "C", 30: "C", 15: "C",
  10: "B", 11: "C", 5: "A", 26: "C", 27: "B",
  3: "B", 20: "B", 23: "B", 24: "B", 28: "B",
  6: "B", 21: "B", 25: "C", 29: "A", 16: "A",
};

const reasoningConceptMap = {
  19: "selection",
  13: "variation",
  32: "molecular",
  15: "structure",
  27: "patterns",
  28: "speciation",
  16: "species",
};

const validTransitions = {
  selection: "variation",
  variation: "molecular",
  molecular: "structure",
  structure: "patterns",
  patterns: "speciation",
  speciation: "species",
};

const conceptLabels = {
  1: "Natural Selection",
  2: "Variation & Genetics",
  3: "Molecular Evidence",
  4: "Structural Evidence",
  5: "Fossils & Patterns",
  6: "Speciation",
  7: "Species & Gene Flow",
};

const componentBank = {
  1: { A: "Traits change because environments affect individuals.", B: "Populations evolve through natural selection.", C: "Organisms develop traits they need during their lifetime.", D: "Environmental pressure causes every individual to adapt in the same way over time.", E: "Mutations appear and spread automatically in populations." },
  7: { A: "Mutations can move between individuals after they appear.", B: "New traits are learned and passed to offspring.", C: "Individuals with advantageous traits leave more offspring.", D: "Populations tend to improve traits because they need them.", E: "When environments change, all organisms gain the same mutation." },
  8: { A: "Medium traits can be favored when extremes are selected against.", B: "The smallest individuals always survive best in predator-prey systems.", C: "Traits become more common when they are rare.", D: "Selection always favors the largest individuals in a population.", E: "Body size has no effect on survival when predators are present." },
  22: { A: "Organisms change traits because they try to adapt to their environment.", B: "Traits that increase access to resources can increase reproductive success.", C: "Environmental changes directly rewrite DNA in individuals.", D: "Individuals stop reproducing if they cannot compete for resources.", E: "Traits that improve survival are automatically passed to all offspring." },
  19: { A: "Pollution causes mutations to stop in affected populations.", B: "Resistant traits appear because environments directly create them in organisms.", C: "Natural selection can increase the frequency of advantageous alleles in a population.", D: "All individuals in a population respond the same way to environmental stress.", E: "Organisms without useful traits are immediately removed from the population." },
  31: { A: "Traits change because organisms use them more.", B: "New traits appear when environments demand them.", C: "Genetic variation comes from mutations in DNA.", D: "All organisms develop the same traits over time.", E: "Reproduction creates completely new traits each generation." },
  33: { A: "Body cells and gametes contain the same number of chromosomes.", B: "Gametes always contain random chromosome numbers.", C: "Chromosomes double during reproduction.", D: "Gametes have half the chromosome number of body cells.", E: "Chromosome number is not related to reproduction." },
  34: { A: "Chromosomes are made mostly of proteins and lipids.", B: "DNA stores genetic information in chromosomes.", C: "Water carries genetic traits through cells.", D: "Sugars determine inherited characteristics.", E: "RNA replaces DNA in most organisms." },
  35: { A: "Dominant traits require two dominant alleles.", B: "Traits appear randomly in offspring.", C: "Recessive traits require two recessive alleles.", D: "Chromosomes determine which traits exist.", E: "All traits are expressed equally." },
  13: { A: "Natural selection requires genetic variation within a population.", B: "Evolution occurs even when all individuals are identical.", C: "Traits do not need to vary for selection to occur.", D: "Mutations are unrelated to evolution.", E: "Survival happens independently of inherited traits." },
  4: { A: "Organisms that live in the same place are closely related.", B: "Similar traits always indicate close evolutionary relationships.", C: "Genetic similarity is the strongest evidence of relatedness.", D: "Animals with similar behaviors must share a recent ancestor.", E: "Lifespan determines how closely species are related." },
  9: { A: "Species that share habitats are usually closely related.", B: "DNA sequences can be compared to determine relatedness.", C: "Nest structure determines evolutionary history.", D: "Diet provides the strongest evidence of ancestry.", E: "Geographic range proves evolutionary relationships." },
  12: { A: "Protein differences cannot be used to compare species.", B: "More amino acid differences indicate closer relationships.", C: "Amino acid sequences vary randomly between species.", D: "Fewer amino acid differences suggest closer evolutionary relationships.", E: "All species have identical protein sequences." },
  18: { A: "Species with the largest size difference are most closely related.", B: "The organism with the fewest protein differences is most closely related.", C: "Molecular comparisons are not useful for determining ancestry.", D: "The most common species is usually the closest relative.", E: "Evolutionary relationships are based only on physical traits." },
  32: { A: "Species with similar habitats are more closely related.", B: "DNA differences do not affect evolutionary relationships.", C: "Fewer DNA differences indicate a more recent common ancestor.", D: "All species with similar DNA are identical.", E: "Time alone determines evolutionary relationships." },
  2: { A: "Structures that look alike always have the same function.", B: "Similar environments create identical structures in all organisms.", C: "Homologous structures provide evidence of common ancestry.", D: "Organisms with similar limbs must live in the same habitat.", E: "Body structures develop randomly over time." },
  14: { A: "Cave fish are developing better vision over time.", B: "Reduced or nonfunctional structures can be inherited from ancestors.", C: "Traits disappear immediately when they are not used.", D: "All organisms improve traits to match their environment.", E: "Extra DNA causes structures to shrink." },
  17: { A: "Genes that no longer function are removed from populations quickly.", B: "Organisms only keep genes that are currently useful.", C: "Mutated genes can still be passed down from ancestors.", D: "Genes change purpose every generation.", E: "Environmental conditions store genetic information." },
  30: { A: "Vestigial structures are newly forming features.", B: "Structures only found in embryos are vestigial.", C: "Vestigial structures are reduced features inherited from ancestors.", D: "Injuries cause vestigial traits.", E: "Vestigial traits are used only for reproduction." },
  15: { A: "Diet and habitat provide the strongest evidence of relatedness.", B: "Body size determines evolutionary relationships.", C: "Gene sequences and inherited structures together provide strong evidence of common ancestry.", D: "Behavior is the most reliable indicator of ancestry.", E: "All organisms with similar traits are closely related." },
  10: { A: "Fossils only show where organisms lived.", B: "Transitional fossils provide evidence of evolutionary change over time.", C: "Fossils prove all organisms existed at the same time.", D: "Fossils only reveal the age of individual organisms.", E: "Fossils show how long species survive without changing." },
  11: { A: "The top layer contains the oldest fossils.", B: "Fossils are randomly distributed across layers.", C: "The oldest fossils are found in the deepest undisturbed layers.", D: "All fossils appear in the same layer.", E: "Younger layers contain earlier species." },
  5: { A: "Organisms with similar embryos may share a common ancestor.", B: "Embryos determine adult behavior.", C: "Similar embryos prove identical species.", D: "Diet influences embryo development.", E: "All embryos develop the same structures." },
  26: { A: "Similar habitats indicate close relationships.", B: "Behavior determines ancestry.", C: "DNA and protein similarities can support common ancestry.", D: "Geographic location determines ancestry.", E: "Body size determines evolutionary relationships." },
  27: { A: "Species that look alike always share a recent common ancestor.", B: "Similar traits can evolve independently in similar environments.", C: "All species with similar structures have identical DNA.", D: "Environmental conditions eliminate genetic differences.", E: "Evolution produces identical outcomes in all populations." },
  3: { A: "Environmental changes cause all organisms to evolve in the same way.", B: "Populations that are separated can eventually become different species.", C: "Species remain the same unless they go extinct.", D: "Organisms change only when new predators appear.", E: "Developmental stages determine whether speciation occurs." },
  20: { A: "Differences in prey type indicate geographic isolation.", B: "A physical barrier separating populations limits interaction.", C: "Temperature differences always lead to new species.", D: "Protein differences alone prove isolation.", E: "Embryo development determines geographic separation." },
  23: { A: "Populations in the same environment evolve at the same rate.", B: "Isolation combined with different selection pressures can cause divergence.", C: "Mutation stops when populations are separated.", D: "Equal survival prevents evolutionary change.", E: "DNA remains identical across isolated populations." },
  24: { A: "Island environments eliminate genetic variation.", B: "Geographic isolation can reduce gene flow between populations.", C: "All island species evolve into new species immediately.", D: "Water barriers increase reproduction rates.", E: "Chromosome changes occur only on islands." },
  28: { A: "Movement of individuals between areas is the same as gene flow.", B: "Gene flow occurs when alleles are transferred through reproduction between populations.", C: "Mutation is the only factor that determines whether populations diverge.", D: "Environments directly control which genes are passed on.", E: "Populations stop evolving when separated." },
  6: { A: "Organisms in the same habitat are always the same species.", B: "Species are groups that can produce fertile offspring.", C: "Similar appearance defines species.", D: "Diet determines species classification.", E: "Behavior alone defines species boundaries." },
  21: { A: "Comparing color patterns is the best way to determine relatedness.", B: "Comparing DNA sequences can reveal reproductive isolation.", C: "Rainfall patterns determine species boundaries.", D: "Mountain height determines whether populations are related.", E: "Prey size explains reproductive isolation." },
  25: { A: "Species in the same location are closely related.", B: "Shared physical traits always indicate close ancestry.", C: "Classification into the same genus indicates close evolutionary relationship.", D: "Diet determines how species are related.", E: "Body size determines ancestry." },
  29: { A: "Continuous gene flow keeps populations genetically connected.", B: "Gene flow always causes new species to form.", C: "Populations stop evolving when gene flow occurs.", D: "Gene flow eliminates all variation.", E: "Populations become identical in all traits when gene flow continues." },
  16: { A: "Rapid reproduction can increase the rate of evolutionary change.", B: "Evolution occurs only in organisms with many chromosomes.", C: "Mutation stops when populations grow quickly.", D: "Inheritance does not affect population change.", E: "Selection is unrelated to reproduction." },
};

function buildComponent(q, answer) {
  if (!answer || !componentBank[q]?.[answer]) return null;
  return { id: `${q}-${answer}`, q, answer, text: componentBank[q][answer] };
}

function getCycleForQuestion(q) {
  for (const [cycle, qs] of Object.entries(cycleOrder)) {
    if (qs.includes(q)) return Number(cycle);
  }
  return null;
}

function removeComponentEverywhere(placements, itemId) {
  const next = {};
  const affectedCycles = new Set();
  for (let c = 1; c <= CYCLES; c++) {
    const p = placements[c];
    const hadClaim = p.claim?.id === itemId;
    const hadReasoning = p.reasoning?.id === itemId;
    const hadEvidence = p.evidence.some((e) => e.id === itemId);
    if (hadClaim || hadReasoning || hadEvidence) affectedCycles.add(c);
    next[c] = {
      claim: hadClaim ? null : p.claim,
      reasoning: hadReasoning ? null : p.reasoning,
      evidence: p.evidence.filter((e) => e.id !== itemId),
    };
  }
  return { next, affectedCycles };
}

function AppCard({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}

function CycleFeedback({ fb, mode }) {
  if (!fb) return null;
  return (
    <div className="feedback">
      {fb.unattempted && <div className="warn">Complete all five answers before checking.</div>}
      {!fb.unattempted && !fb.overall && (
        <div className="error-line">
          <AlertCircle size={16} /> Incorrect
        </div>
      )}
      {mode === "normal" && !fb.unattempted && (
        <>
          <div className={fb.claim ? "ok" : "bad"}>Claim</div>
          <div className={fb.evidence ? "ok" : "bad"}>Evidence</div>
          <div className={fb.reasoning ? "ok" : "bad"}>Reasoning</div>
        </>
      )}
      {mode === "hard" && !fb.unattempted && !fb.chain && <div className="warn">Reasoning chain broken</div>}
      {fb.overall && (
        <div className="success-line">
          <CheckCircle2 size={16} /> Cycle Complete
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("normal");
  const [answers, setAnswers] = useState(Object.fromEntries(Array.from({ length: TOTAL_QUESTIONS }, (_, i) => [i + 1, ""])));
  const [feedback, setFeedback] = useState({});
  const [dragItem, setDragItem] = useState(null);
  const [placements, setPlacements] = useState(
    Object.fromEntries(Array.from({ length: CYCLES }, (_, i) => [i + 1, { claim: null, evidence: [], reasoning: null }]))
  );
  const [attempts, setAttempts] = useState(Object.fromEntries(Array.from({ length: CYCLES }, (_, i) => [i + 1, 0])));
  const [seenIds, setSeenIds] = useState(new Set());
  const [showNewIds, setShowNewIds] = useState([]);
  const revealTimerRef = useRef(null);

  const available = useMemo(() => {
    const out = {};
    for (let cycle = 1; cycle <= CYCLES; cycle++) {
      out[cycle] = cycleOrder[cycle].map((q) => buildComponent(q, answers[q])).filter(Boolean);
    }
    return out;
  }, [answers]);

  const currentAvailableIds = useMemo(() => Object.values(available).flat().map((x) => x.id), [available]);

  const dynamicCycleStatus = useMemo(() => {
    const status = {};
    let prevAllGood = true;
    for (let cycle = 1; cycle <= CYCLES; cycle++) {
      const fb = feedback[cycle];
      const complete = !!fb?.overall;
      const accessible = mode === "normal" ? true : prevAllGood;
      status[cycle] = { complete, accessible };
      prevAllGood = prevAllGood && complete;
    }
    return status;
  }, [feedback, mode]);

  const allComplete = useMemo(
    () => Array.from({ length: CYCLES }, (_, i) => i + 1).every((cycle) => feedback[cycle]?.overall),
    [feedback]
  );

  const usedComponentIds = useMemo(() => {
    const ids = new Set();
    Object.values(placements).forEach((p) => {
      if (p.claim) ids.add(p.claim.id);
      if (p.reasoning) ids.add(p.reasoning.id);
      p.evidence.forEach((e) => ids.add(e.id));
    });
    return ids;
  }, [placements]);

  function invalidateFromCycle(startCycle) {
    setFeedback((prev) => {
      const next = { ...prev };
      for (let cycle = startCycle; cycle <= CYCLES; cycle++) delete next[cycle];
      return next;
    });
  }

  function registerReveal(nextIds) {
    const newIds = nextIds.filter((id) => !seenIds.has(id));
    if (newIds.length) {
      setShowNewIds(newIds);
      if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current);
      revealTimerRef.current = window.setTimeout(() => setShowNewIds([]), 1200);
      setSeenIds((prev) => {
        const updated = new Set(prev);
        newIds.forEach((id) => updated.add(id));
        return updated;
      });
    }
  }

  function setAns(q, v) {
    const up = v.toUpperCase();
    if (up === "" || LETTERS.includes(up)) {
      const cycle = getCycleForQuestion(q);
      const nextAnswers = { ...answers, [q]: up };
      setAnswers(nextAnswers);
      if (cycle) invalidateFromCycle(cycle);
      const nextAvailable = Object.values(cycleOrder)
        .flat()
        .map((qq) => buildComponent(qq, nextAnswers[qq]))
        .filter(Boolean)
        .map((x) => x.id);
      registerReveal(nextAvailable);
    }
  }

  function onDragStart(e, item) {
    setDragItem(item);
    if (e && item) e.dataTransfer.setData("text/plain", JSON.stringify(item));
  }

  function onDragEnd() {
    setDragItem(null);
  }

  function readDragged(e) {
    try {
      const data = e?.dataTransfer?.getData("text/plain");
      return data ? JSON.parse(data) : dragItem;
    } catch {
      return dragItem;
    }
  }

  function atomicPlace(cycle, targetSlot, item) {
    setPlacements((prev) => {
      const { next, affectedCycles } = removeComponentEverywhere(prev, item.id);
      affectedCycles.add(cycle);

      if (targetSlot === "claim") {
        next[cycle].claim = item;
      } else if (targetSlot === "reasoning") {
        next[cycle].reasoning = item;
      } else if (targetSlot === "evidence") {
        if (next[cycle].evidence.length >= 3) return prev;
        next[cycle].evidence = [...next[cycle].evidence, item];
      }

      invalidateFromCycle(Math.min(...affectedCycles));
      return next;
    });
    setDragItem(null);
  }

  function placeClaim(e, cycle) { const item = readDragged(e); if (!item) return; atomicPlace(cycle, "claim", item); }
  function placeReasoning(e, cycle) { const item = readDragged(e); if (!item) return; atomicPlace(cycle, "reasoning", item); }
  function placeEvidence(e, cycle) { const item = readDragged(e); if (!item) return; atomicPlace(cycle, "evidence", item); }
  function addToClaim(cycle, item) { atomicPlace(cycle, "claim", item); }
  function addToEvidence(cycle, item) { atomicPlace(cycle, "evidence", item); }
  function addToReasoning(cycle, item) { atomicPlace(cycle, "reasoning", item); }

  function removePlaced(cycle, slot, index = null) {
    setPlacements((prev) => {
      const next = { ...prev };
      if (slot === "evidence") next[cycle] = { ...next[cycle], evidence: next[cycle].evidence.filter((_, i) => i !== index) };
      else next[cycle] = { ...next[cycle], [slot]: null };
      return next;
    });
    invalidateFromCycle(cycle);
  }

  function validateCER(cycle) {
    const qs = cycleOrder[cycle];
    const placed = placements[cycle];
    const user = qs.map((q) => answers[q]);
    const truth = qs.map((q) => correct[q]);
    const result = { claim: true, evidence: true, reasoning: true, structure: true, chain: true, overall: true, unattempted: false };

    if (user.some((a) => !a)) {
      return { claim: false, evidence: false, reasoning: false, structure: false, chain: false, overall: false, unattempted: true };
    }

    if (user[0] !== truth[0]) result.claim = false;
    for (let i = 1; i <= 3; i++) if (user[i] !== truth[i]) result.evidence = false;
    if (user[4] !== truth[4]) result.reasoning = false;

    const expectedClaimQ = qs[0];
    const expectedEvidenceQs = [qs[1], qs[2], qs[3]].sort((a, b) => a - b);
    const expectedReasoningQ = qs[4];

    const claimPlacedCorrectly = placed.claim?.q === expectedClaimQ;
    const reasoningPlacedCorrectly = placed.reasoning?.q === expectedReasoningQ;
    const evidencePlacedQs = placed.evidence.map((x) => x.q).sort((a, b) => a - b);
    const evidencePlacedCorrectly = JSON.stringify(evidencePlacedQs) === JSON.stringify(expectedEvidenceQs);

    if (!claimPlacedCorrectly) result.claim = false;
    if (!evidencePlacedCorrectly) result.evidence = false;
    if (!reasoningPlacedCorrectly) result.reasoning = false;
    if (!(result.claim && result.evidence && result.reasoning)) result.structure = false;

    if (cycle > 1) {
      const prevCycleFeedback = feedback[cycle - 1];
      if (!prevCycleFeedback?.overall) {
        result.chain = false;
      } else {
        const prevReasoningQ = cycleOrder[cycle - 1][4];
        const currentReasoningQ = cycleOrder[cycle][4];
        const prevConcept = reasoningConceptMap[prevReasoningQ];
        const currentConcept = reasoningConceptMap[currentReasoningQ];
        if (validTransitions[prevConcept] !== currentConcept) result.chain = false;
      }
    }

    result.overall = result.structure && result.chain;
    return result;
  }

  function checkCycle(cycle) {
    if (!dynamicCycleStatus[cycle].accessible) return;
    setAttempts((p) => ({ ...p, [cycle]: p[cycle] + 1 }));
    const result = validateCER(cycle);
    setFeedback((p) => ({ ...p, [cycle]: result }));
  }

  function reset() {
    setAnswers(Object.fromEntries(Array.from({ length: TOTAL_QUESTIONS }, (_, i) => [i + 1, ""])));
    setFeedback({});
    setDragItem(null);
    setPlacements(Object.fromEntries(Array.from({ length: CYCLES }, (_, i) => [i + 1, { claim: null, evidence: [], reasoning: null }])));
    setAttempts(Object.fromEntries(Array.from({ length: CYCLES }, (_, i) => [i + 1, 0])));
    setSeenIds(new Set());
    setShowNewIds([]);
    if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current);
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setFeedback({});
    setAttempts(Object.fromEntries(Array.from({ length: CYCLES }, (_, i) => [i + 1, 0])));
    setPlacements(Object.fromEntries(Array.from({ length: CYCLES }, (_, i) => [i + 1, { claim: null, evidence: [], reasoning: null }])));
    setDragItem(null);
  }

  return (
    <div className="page">
      <div className="container">
        <AppCard>
          <div className="card-header">
            <h1>Evolution Chain — Drag, Sort, and Check</h1>
            <p>Answer choices reveal unlabeled components. Sort them into the right CER boxes and complete the full reasoning chain.</p>
          </div>

          <div className="toolbar">
            <Button onClick={() => switchMode("normal")} className={mode === "normal" ? "" : "secondary"}>Normal</Button>
            <Button onClick={() => switchMode("hard")} className={mode === "hard" ? "" : "secondary"}>Hard</Button>
            <Button onClick={reset} className="secondary"><RotateCcw size={16} /> Reset</Button>
          </div>

          <div>
            <div className="section-label">Chain Integrity Meter</div>
            <div className="meter-grid">
              {Array.from({ length: CYCLES }, (_, i) => i + 1).map((cycle) => {
                const fb = feedback[cycle];
                const accessible = dynamicCycleStatus[cycle].accessible;
                let cls = "meter neutral";
                if (!accessible) cls = "meter locked";
                else if (fb?.overall) cls = "meter success";
                else if (fb && !fb.overall) cls = fb.chain ? "meter error" : "meter warning";

                return (
                  <div key={cycle} className={cls}>
                    <div>Cycle {cycle}</div>
                    <div className="meter-sub">{conceptLabels[cycle]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </AppCard>

        <div className="grid">
          <AppCard>
            <div className="card-header">
              <h2>Answer Entry</h2>
            </div>
            <div className="answer-grid">
              {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => {
                const q = i + 1;
                const cycle = getCycleForQuestion(q);
                const accessible = cycle ? dynamicCycleStatus[cycle].accessible || mode === "normal" : true;
                return (
                  <div key={q} className="answer-box">
                    <div className="answer-row">
                      <span>Q{q}</span>
                      <input
                        value={answers[q]}
                        onChange={(e) => setAns(q, e.target.value)}
                        className="answer-input"
                        disabled={!accessible}
                        maxLength={1}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </AppCard>

          <div className="cycles">
            {Array.from({ length: CYCLES }, (_, i) => i + 1).map((cycle) => {
              const fb = feedback[cycle];
              const accessible = dynamicCycleStatus[cycle].accessible;
              const placed = placements[cycle];
              const quality = fb?.overall
                ? attempts[cycle] === 1
                  ? { label: "Perfect Build", icon: <Trophy size={14} /> }
                  : attempts[cycle] <= 3
                  ? { label: "Revised Success", icon: <Sparkles size={14} /> }
                  : { label: "Persistent Solver", icon: <Sparkles size={14} /> }
                : null;

              return (
                <AppCard key={cycle} className={!accessible ? "dimmed" : ""}>
                  <div className="card-header">
                    <div className="cycle-title">
                      {accessible ? <Unlock size={18} /> : <Lock size={18} />}
                      <h2>Cycle {cycle}</h2>
                      <Badge>{conceptLabels[cycle]}</Badge>
                      {quality && <Badge>{quality.icon} {quality.label}</Badge>}
                    </div>
                  </div>

                  <div>
                    <div className="section-label">Revealed components</div>
                    <div className="component-grid">
                      {available[cycle].map((item) => (
                        <DraggableComponent
                          key={item.id}
                          item={item}
                          onDragStart={onDragStart}
                          newlyUnlocked={showNewIds.includes(item.id)}
                          disabled={!accessible || usedComponentIds.has(item.id)}
                          onAddToClaim={(it) => addToClaim(cycle, it)}
                          onAddToEvidence={(it) => addToEvidence(cycle, it)}
                          onAddToReasoning={(it) => addToReasoning(cycle, it)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="drop-grid">
                    <DropBox title="Claim" onDrop={(e) => placeClaim(e, cycle)} disabled={!accessible}>
                      {placed.claim ? (
                        <div className="placed-box">
                          <div className="placed-top">
                            <div className="badge-row">
                              <Badge>Q{placed.claim.q}</Badge>
                              <Badge>{placed.claim.answer}</Badge>
                            </div>
                            <Button className="ghost" onClick={() => removePlaced(cycle, "claim")}>Remove</Button>
                          </div>
                          <div className="placed-text">{placed.claim.text}</div>
                        </div>
                      ) : (
                        <div className="placeholder">Drag one revealed component here, or use the add buttons.</div>
                      )}
                    </DropBox>

                    <DropBox title="Evidence (3)" onDrop={(e) => placeEvidence(e, cycle)} subtle disabled={!accessible}>
                      {placed.evidence.length ? placed.evidence.map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="placed-box">
                          <div className="placed-top">
                            <div className="badge-row">
                              <Badge>Q{item.q}</Badge>
                              <Badge>{item.answer}</Badge>
                            </div>
                            <Button className="ghost" onClick={() => removePlaced(cycle, "evidence", idx)}>Remove</Button>
                          </div>
                          <div className="placed-text">{item.text}</div>
                        </div>
                      )) : (
                        <div className="placeholder">Drag three revealed components here, or use the add buttons.</div>
                      )}
                    </DropBox>

                    <DropBox title="Reasoning" onDrop={(e) => placeReasoning(e, cycle)} disabled={!accessible}>
                      {placed.reasoning ? (
                        <div className="placed-box">
                          <div className="placed-top">
                            <div className="badge-row">
                              <Badge>Q{placed.reasoning.q}</Badge>
                              <Badge>{placed.reasoning.answer}</Badge>
                            </div>
                            <Button className="ghost" onClick={() => removePlaced(cycle, "reasoning")}>Remove</Button>
                          </div>
                          <div className="placed-text">{placed.reasoning.text}</div>
                        </div>
                      ) : (
                        <div className="placeholder">Drag one revealed component here, or use the add buttons.</div>
                      )}
                    </DropBox>
                  </div>

                  <Button onClick={() => checkCycle(cycle)} disabled={!accessible}>Check Cycle</Button>
                  <CycleFeedback fb={fb} mode={mode} />
                </AppCard>
              );
            })}

            {allComplete && (
              <AppCard className="final-card">
                <div className="card-header">
                  <div className="cycle-title">
                    <Trophy size={18} />
                    <h2>Full Evolution Chain Complete</h2>
                  </div>
                  <p>You assembled the entire sequence of scientific thinking across all 7 cycles.</p>
                </div>

                <div className="final-list">
                  {Array.from({ length: CYCLES }, (_, i) => i + 1).map((cycle) => {
                    const placed = placements[cycle];
                    return (
                      <div key={cycle} className="final-item">
                        <div className="badge-row">
                          <Badge>Cycle {cycle}</Badge>
                          <Badge>{conceptLabels[cycle]}</Badge>
                        </div>
                        <div><strong>Claim:</strong> {placed.claim?.text || "—"}</div>
                        <div className="evidence-list">
                          <strong>Evidence:</strong>
                          <ul>
                            {placed.evidence.map((e) => <li key={e.id}>{e.text}</li>)}
                          </ul>
                        </div>
                        <div><strong>Reasoning:</strong> {placed.reasoning?.text || "—"}</div>
                      </div>
                    );
                  })}
                </div>
              </AppCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
