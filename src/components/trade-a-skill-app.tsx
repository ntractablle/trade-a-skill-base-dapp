"use client";

import {
  BadgeCheck,
  Clock3,
  Handshake,
  IdCard,
  Loader2,
  Search,
  Sparkles,
  Sticker,
  UserRoundSearch,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { parseEventLogs, type Address } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import {
  MAX_FORMAT_LENGTH,
  MAX_NOTE_LENGTH,
  MAX_OFFER_LENGTH,
  MAX_TIME_LENGTH,
  MAX_WANT_LENGTH,
  tradeASkillAbi,
  tradeASkillContractAddress,
} from "@/lib/trade-a-skill";

const PRESETS = [
  {
    offerSkill: "Figma landing polish",
    wantSkill: "Short product copy",
    format: "30 min swap",
    timeWindow: "this week",
    note: "I can tighten layout and hierarchy. Looking for punchier copy for one ship-ready page.",
  },
  {
    offerSkill: "Prompt workflow review",
    wantSkill: "Framer motion help",
    format: "async trade",
    timeWindow: "48 hours",
    note: "I will review your prompts and output structure. Need a clean motion pass for a product screen.",
  },
  {
    offerSkill: "Base app feedback",
    wantSkill: "Logo cleanup",
    format: "one call",
    timeWindow: "weekend",
    note: "I can test flows and trim friction. Need a small icon cleanup before I submit the app.",
  },
] as const;

function shortAddress(address?: Address) {
  if (!address || address === "0x0000000000000000000000000000000000000000") return "--";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(value?: bigint) {
  if (!value) return "--";
  return new Date(Number(value) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function friendlyError(error: unknown) {
  if (!(error instanceof Error)) return "Transaction was cancelled.";
  if (error.message.includes("User rejected")) return "Request cancelled in wallet.";
  if (error.message.includes("Invalid offer")) return "Offer skill needs 1 to 42 characters.";
  if (error.message.includes("Invalid want")) return "Wanted skill needs 1 to 42 characters.";
  if (error.message.includes("Invalid format")) return "Format needs 1 to 24 characters.";
  if (error.message.includes("Invalid time")) return "Time window needs 1 to 28 characters.";
  if (error.message.includes("Invalid note")) return "Note needs 1 to 180 characters.";
  return error.message;
}

function SkillCard({
  offerSkill,
  wantSkill,
  format,
  timeWindow,
  note,
  maker,
  createdAt,
}: {
  offerSkill: string;
  wantSkill: string;
  format: string;
  timeWindow: string;
  note: string;
  maker?: Address;
  createdAt?: bigint;
}) {
  return (
    <article className="skill-stage">
      <div className="sticker sticker-a" aria-hidden="true">
        <Sticker />
      </div>
      <div className="sticker sticker-b" aria-hidden="true">
        <Sparkles />
      </div>

      <header className="skill-head">
        <div>
          <p className="eyebrow">Trade A Skill</p>
          <h2>Swap one skill.</h2>
        </div>
        <div className="id-chip">
          <IdCard />
        </div>
      </header>

      <section className="swap-grid">
        <div className="swap-cell offer">
          <span>I can offer</span>
          <strong>{offerSkill || "--"}</strong>
        </div>
        <div className="swap-cell want">
          <span>I want</span>
          <strong>{wantSkill || "--"}</strong>
        </div>
      </section>

      <section className="meta-strip">
        <div>
          <Handshake />
          <span>{format || "--"}</span>
        </div>
        <div>
          <Clock3 />
          <span>{timeWindow || "--"}</span>
        </div>
      </section>

      <section className="note-card">
        <span>Trade note</span>
        <p>{note || "Post one compact skill swap card on Base."}</p>
      </section>

      <footer className="card-foot">
        <div>
          <Wallet />
          <span>{shortAddress(maker)}</span>
        </div>
        <div>
          <BadgeCheck />
          <span>{formatDate(createdAt)}</span>
        </div>
      </footer>
    </article>
  );
}

export function TradeASkillApp() {
  const [cardIdInput, setCardIdInput] = useState("1");
  const [offerSkill, setOfferSkill] = useState<string>(PRESETS[0].offerSkill);
  const [wantSkill, setWantSkill] = useState<string>(PRESETS[0].wantSkill);
  const [format, setFormat] = useState<string>(PRESETS[0].format);
  const [timeWindow, setTimeWindow] = useState<string>(PRESETS[0].timeWindow);
  const [note, setNote] = useState<string>(PRESETS[0].note);
  const [message, setMessage] = useState("Post a skill swap card on Base.");
  const [lastAction, setLastAction] = useState<"post" | null>(null);

  const { address, chainId, connector, isConnected } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { disconnectAsync } = useDisconnect();
  async function disconnectWallet() {
    try {
      if (connector) {
        await disconnectAsync({ connector });
      } else {
        await disconnectAsync();
      }
    } catch {}
  }
  const { switchChain, isPending: switching } = useSwitchChain();
  const { data: hash, writeContractAsync, isPending: writing } = useWriteContract();
  const { data: receipt, isLoading: confirming } = useWaitForTransactionReceipt({ hash });

  const selectedConnector =
    connectors.find((connector) => connector.id === "injected") ??
    connectors.find((connector) => connector.id === "baseAccount") ??
    connectors[0];
  const parsedCardId = BigInt(Math.max(1, Number(cardIdInput || "1")));

  const cardQuery = useReadContract({
    abi: tradeASkillAbi,
    address: tradeASkillContractAddress,
    functionName: "getCard",
    args: [parsedCardId],
    query: { enabled: Boolean(tradeASkillContractAddress), refetchInterval: 12000 },
  });

  const totalQuery = useReadContract({
    abi: tradeASkillAbi,
    address: tradeASkillContractAddress,
    functionName: "nextCardId",
    query: { enabled: Boolean(tradeASkillContractAddress), refetchInterval: 12000 },
  });

  const tuple = cardQuery.data as
    | readonly [Address, string, string, string, string, string, bigint]
    | undefined;

  const liveCard = useMemo(
    () =>
      tuple
        ? {
            maker: tuple[0],
            offerSkill: tuple[1],
            wantSkill: tuple[2],
            format: tuple[3],
            timeWindow: tuple[4],
            note: tuple[5],
            createdAt: tuple[6],
          }
        : undefined,
    [tuple],
  );

  const totalCards = totalQuery.data ? Math.max(Number(totalQuery.data) - 1, 0) : 0;
  const validFields =
    offerSkill.trim().length > 0 &&
    offerSkill.trim().length <= MAX_OFFER_LENGTH &&
    wantSkill.trim().length > 0 &&
    wantSkill.trim().length <= MAX_WANT_LENGTH &&
    format.trim().length > 0 &&
    format.trim().length <= MAX_FORMAT_LENGTH &&
    timeWindow.trim().length > 0 &&
    timeWindow.trim().length <= MAX_TIME_LENGTH &&
    note.trim().length > 0 &&
    note.trim().length <= MAX_NOTE_LENGTH;

  const postBlocker = !tradeASkillContractAddress
    ? "Contract not deployed yet. Run npm run deploy:contract, then add NEXT_PUBLIC_TRADE_A_SKILL_CONTRACT_ADDRESS."
    : !isConnected
      ? "Connect wallet first."
      : chainId !== base.id
        ? "Switch to Base first."
        : !validFields
          ? "Fill offer, want, format, time window, and note."
          : "";

  useEffect(() => {
    if (!receipt || lastAction !== "post") return;
    void totalQuery.refetch();
    void cardQuery.refetch();
    const logs = parseEventLogs({ abi: tradeASkillAbi, logs: receipt.logs, eventName: "CardPosted" });
    const cardId = logs[0]?.args.cardId;
    window.setTimeout(() => {
      if (cardId) setCardIdInput(cardId.toString());
      setMessage(cardId ? `Skill card #${cardId.toString()} posted on Base.` : "Skill card posted on Base.");
    }, 0);
  }, [lastAction, receipt, totalQuery, cardQuery]);

  async function connectWallet() {
    const connectorQueue = [
      connectors.find((connector) => connector.id === "injected"),
      connectors.find((connector) => connector.id === "baseAccount"),
      selectedConnector,
    ]
      .filter((connector): connector is NonNullable<typeof selectedConnector> => Boolean(connector))
      .filter((connector, index, queue) => queue.findIndex((item) => item.id === connector.id) === index);

    if (connectorQueue.length === 0) {
      setMessage("No wallet connector found. Open this app inside Base App or a wallet browser.");
      return;
    }

    let lastError: unknown;
    setMessage("Opening wallet connection...");
    for (const connector of connectorQueue) {
      try {
        await connectAsync({ connector });
        setMessage("Wallet connected. Post the skill card when ready.");
        return;
      } catch (error) {
        lastError = error;
      }
    }
    setMessage(friendlyError(lastError));
  }

  async function postCard() {
    const contractAddress = tradeASkillContractAddress;
    if (postBlocker) {
      setMessage(postBlocker);
      return;
    }
    if (!contractAddress) {
      setMessage("Contract not deployed yet. Run npm run deploy:contract first.");
      return;
    }
    try {
      setLastAction("post");
      setMessage("Confirm the skill card in your wallet.");
      await writeContractAsync({
        address: contractAddress,
        abi: tradeASkillAbi,
        functionName: "postCard",
        args: [offerSkill.trim(), wantSkill.trim(), format.trim(), timeWindow.trim(), note.trim()],
        chainId: base.id,
      });
      setMessage("Skill card sent. Waiting for Base confirmation...");
    } catch (error) {
      setMessage(friendlyError(error));
    }
  }

  function applyPreset(index: number) {
    const preset = PRESETS[index];
    setOfferSkill(preset.offerSkill);
    setWantSkill(preset.wantSkill);
    setFormat(preset.format);
    setTimeWindow(preset.timeWindow);
    setNote(preset.note);
  }

  return (
    <main className="min-h-screen bg-[#fff8ec] text-[#15233b]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-5 px-4 py-4 lg:grid-cols-[390px_minmax(0,1fr)] lg:px-6">
        <aside className="skill-dock">
          <header className="dock-head">
            <div>
              <p className="eyebrow">Trade A Skill</p>
              <h1>Swap one useful skill.</h1>
            </div>
            <div className="dock-badge">
              <Handshake aria-hidden="true" />
            </div>
          </header>

          <section className="mini-stats">
            <div>
              <span>Cards</span>
              <strong>{totalCards}</strong>
            </div>
            <div>
              <span>Chain</span>
              <strong>Base</strong>
            </div>
          </section>

          <section className="skill-form">
            <div className="form-title">
              <UserRoundSearch aria-hidden="true" />
              <h2>New card</h2>
            </div>
            <div className="preset-row">
              {PRESETS.map((preset, index) => (
                <button key={preset.offerSkill} onClick={() => applyPreset(index)}>
                  {index + 1}
                </button>
              ))}
            </div>
            <label>
              <span>I can offer</span>
              <input value={offerSkill} onChange={(event) => setOfferSkill(event.target.value)} maxLength={MAX_OFFER_LENGTH} />
            </label>
            <label>
              <span>I want</span>
              <input value={wantSkill} onChange={(event) => setWantSkill(event.target.value)} maxLength={MAX_WANT_LENGTH} />
            </label>
            <label>
              <span>Format</span>
              <input value={format} onChange={(event) => setFormat(event.target.value)} maxLength={MAX_FORMAT_LENGTH} />
            </label>
            <label>
              <span>Time window</span>
              <input value={timeWindow} onChange={(event) => setTimeWindow(event.target.value)} maxLength={MAX_TIME_LENGTH} />
            </label>
            <label>
              <span>Note</span>
              <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={MAX_NOTE_LENGTH} rows={4} />
            </label>
          </section>

          <section className="action-stack">
            {isConnected && chainId !== base.id ? (
              <button className="primary warn" disabled={switching} onClick={() => switchChain({ chainId: base.id })}>
                {switching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Switch to Base
              </button>
            ) : (
              <button className="primary" disabled={writing || confirming} onClick={postCard}>
                {writing || confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Post on Base
              </button>
            )}
            {isConnected ? (
              <button className="secondary" onClick={disconnectWallet}>
                {shortAddress(address)}
              </button>
            ) : (
              <button className="secondary" disabled={!selectedConnector || connecting} onClick={connectWallet}>
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                Connect wallet
              </button>
            )}
            <p className="status">{message}</p>
            {hash ? (
              <a className="tx-link" href={`https://basescan.org/tx/${hash}`} rel="noreferrer" target="_blank">
                View transaction on BaseScan
              </a>
            ) : null}
          </section>
        </aside>

        <section className="view-stack">
          <SkillCard
            offerSkill={liveCard?.offerSkill || offerSkill}
            wantSkill={liveCard?.wantSkill || wantSkill}
            format={liveCard?.format || format}
            timeWindow={liveCard?.timeWindow || timeWindow}
            note={liveCard?.note || note}
            maker={liveCard?.maker}
            createdAt={liveCard?.createdAt}
          />

          <div className="lower-grid">
            <section className="load-panel">
              <div>
                <Search aria-hidden="true" />
                <h2>Load card</h2>
              </div>
              <label>
                <span>Card ID</span>
                <input value={cardIdInput} onChange={(event) => setCardIdInput(event.target.value.replace(/\D/g, ""))} />
              </label>
            </section>

            <section className="about-panel">
              <p className="eyebrow">What it does</p>
              <p>
                Trade A Skill posts a compact skill exchange card with offer, wanted skill, format, time window, note, wallet, and timestamp on Base.
              </p>
              <div>
                <span><Handshake aria-hidden="true" /> Offer</span>
                <span><UserRoundSearch aria-hidden="true" /> Want</span>
                <span><BadgeCheck aria-hidden="true" /> On Base</span>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
