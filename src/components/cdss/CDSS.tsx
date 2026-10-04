"use client";

import { useState, useEffect } from "react";
import { Engine, EngineRegistry, CancerType } from "@/types";

interface EngineModule {
  default: Engine;
}

export function CDSS() {
  const [engines, setEngines] = useState<Record<CancerType, Engine | null>>({} as Record<CancerType, Engine | null>);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEngines = async () => {
      try {
        const registry = new EngineRegistry();
        const enginePromises = registry.getCancerTypes().map(async (cancerType) => {
          try {
            const module = await import(`@/engines/${cancerType}`);
            return { cancerType, engine: module.default };
          } catch (err) {
            console.error(`Failed to load engine for ${cancerType}:`, err);
            return { cancerType, engine: null };
          }
        });

        const results = await Promise.all(enginePromises);
                const loadedEngines = results.reduce((acc: Record<CancerType, Engine | null>, { cancerType, engine }) => {
          acc[cancerType] = engine;
          return acc;
        }, {} as Record<CancerType, Engine | null>);

        setEngines(loadedEngines);
      } catch (err) {
        setError("Failed to initialize engines");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadEngines();
  }, []);

  if (loading) return <div>Loading engines...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Available Engines</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(engines).map(([cancerType, engine]) => (
          <div key={cancerType} className="border p-4 rounded-lg">
            <h3 className="font-medium capitalize">{cancerType.replace(/-/g, ' ')}</h3>
            <p className="text-sm text-gray-500">
              {engine ? "✅ Loaded" : "❌ Failed to load"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}