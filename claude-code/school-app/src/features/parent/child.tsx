import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { useCurrentSession, useMyChildren } from '@/data/queries';

type Child = NonNullable<ReturnType<typeof useMyChildren>['data']>[number];

type ChildValue = {
  children: Child[];
  selected: Child | undefined;
  select: (enrollmentId: string) => void;
  loading: boolean;
};

const Ctx = createContext<ChildValue | null>(null);

/**
 * Which child the parent is currently looking at.
 *
 * `guardians` is many-to-many by design — siblings share a guardian — so every
 * parent screen reads the selection from here rather than assuming one child,
 * which is the assumption the prototype makes and gets wrong.
 */
export function ChildProvider({ children: tree }: { children: ReactNode }) {
  const session = useCurrentSession();
  const query = useMyChildren(session.data?.id);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const value = useMemo<ChildValue>(() => {
    const list = query.data ?? [];
    return {
      children: list,
      selected: list.find((c) => c.id === selectedId) ?? list[0],
      select: setSelectedId,
      loading: session.isPending || query.isPending,
    };
  }, [query.data, query.isPending, selectedId, session.isPending]);

  return <Ctx.Provider value={value}>{tree}</Ctx.Provider>;
}

export function useChild(): ChildValue {
  const value = useContext(Ctx);
  if (!value) throw new Error('useChild must be used inside <ChildProvider>');
  return value;
}
