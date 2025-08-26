/**
 * Topologically orders derived keys given dependencies.
 * @param deps Map of derivedKey -> string[] of dependencies
 * @returns string[] order to compute derived keys
 * @throws Error on cyclic dependencies (includes one detected cycle)
 */
export function orderDerivations(deps: Record<string, string[]>): string[] {
  const keys = new Set(Object.keys(deps));

  // indegree counts only deps that are also derived keys
  const indeg = new Map<string, number>();
  const adj = new Map<string, Set<string>>(); // dep -> dependents

  for (const k of keys) {
    indeg.set(k, 0);
    adj.set(k, new Set());
  }

  // Build graph among derived keys only
  for (const [k, dlist] of Object.entries(deps)) {
    let count = 0;
    for (const d of dlist) {
      if (keys.has(d)) {
        adj.get(d)!.add(k);
        count++;
      }
    }
    indeg.set(k, count);
  }

  // Kahn’s algorithm
  const queue: string[] = [];
  for (const [k, n] of indeg) if (n === 0) queue.push(k);

  const order: string[] = [];
  while (queue.length) {
    const u = queue.shift()!;
    order.push(u);
    for (const v of adj.get(u) ?? []) {
      indeg.set(v, (indeg.get(v) || 0) - 1);
      if (indeg.get(v) === 0) queue.push(v);
    }
  }

  if (order.length !== keys.size) {
    // cycle detection (simple DFS to build a readable cycle)
    const visited = new Set<string>();
    const onStack = new Set<string>();
    const parent = new Map<string, string>();

    const getDeps = (k: string) => (deps[k] || []).filter((d) => keys.has(d));

    function dfs(u: string): string[] | null {
      visited.add(u);
      onStack.add(u);
      for (const v of getDeps(u)) {
        if (!visited.has(v)) {
          parent.set(v, u);
          const cyc = dfs(v);
          if (cyc) return cyc;
        } else if (onStack.has(v)) {
          // reconstruct cycle u -> ... -> v -> u
          const path = [u];
          let cur = u;
          while (cur !== v) {
            cur = parent.get(cur)!;
            path.push(cur);
          }
          path.reverse(); // v ... u
          return [...path, v];
        }
      }
      onStack.delete(u);
      return null;
    }

    for (const k of keys) {
      if (!visited.has(k)) {
        const cyc = dfs(k);
        if (cyc) {
          throw new Error(`Dependency cycle detected: ${cyc.join(' -> ')}`);
        }
      }
    }
    throw new Error(`Unresolvable dependency cycle`);
  }

  return order;
}
