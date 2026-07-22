"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { Input } from "@/components/ui/Input";
import { ASK_ORION_PROMPTS } from "@/lib/intelligence-data";
import { QUICK_ACTION_BUTTON_CLASSNAME } from "@/lib/constants";

/** Conversational Ask ORION panel with placeholder input and sample prompts. */
export function AskOrionPanel() {
  const [query, setQuery] = useState("");

  return (
    <Card title="Ask ORION">
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            label="Ask ORION"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ask ORION anything..."
          />
          <Button className="shrink-0 justify-center sm:w-auto">Send</Button>
        </div>

        <Divider />

        <div className="space-y-3">
          <p className="text-xs font-medium tracking-[0.14em] text-white/40 uppercase">
            Suggested prompts
          </p>
          <div className="flex flex-wrap gap-2.5">
            {ASK_ORION_PROMPTS.map((prompt) => (
              <Button
                key={prompt}
                type="button"
                className={QUICK_ACTION_BUTTON_CLASSNAME}
                onClick={() => setQuery(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>

        <p className="text-[11px] font-light tracking-wide text-white/30">
          Powered by ORION Intelligence — placeholder mode
        </p>
      </div>
    </Card>
  );
}
