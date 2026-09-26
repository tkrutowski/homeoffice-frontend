import type { TreeNode } from 'primevue/treenode';
import type { LoggerInfo } from '@/features/admin/logs/types';

/** Węzeł drzewa loggerów; `data` jest null dla pakietów, których backend nie zwrócił jako osobnego loggera. */
export interface LoggerTreeNode extends TreeNode {
  /** Pełna nazwa loggera (ścieżka) - jednocześnie klucz zaznaczenia. */
  key: string;
  label: string;
  data: LoggerInfo | null;
  children: LoggerTreeNode[];
  selectable: boolean;
}

function createNode(key: string, label: string): LoggerTreeNode {
  return { key, label, data: null, children: [], selectable: false };
}

/**
 * Sklejanie łańcuchów: pakiet bez własnego wpisu i z jednym dzieckiem (np. `net` → `focik` → `homeoffice`)
 * jest zwijany do jednego węzła `net.focik.homeoffice`, żeby drzewo nie miało kilku pustych poziomów.
 */
function compress(node: LoggerTreeNode): LoggerTreeNode {
  let current = node;
  while (current.data === null && current.children.length === 1) {
    const child = current.children[0];
    current = { ...child, label: `${current.label}.${child.label}` };
  }
  current.children = current.children.map(compress);
  return current;
}

function sortRecursively(nodes: LoggerTreeNode[]): LoggerTreeNode[] {
  for (const node of nodes) sortRecursively(node.children);
  return nodes.sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Buduje drzewo z płaskiej listy loggerów przez podział nazwy po kropce. Wybieralne są węzły, dla których backend
 * zwrócił logger (pakiety i klasy) - zmiana poziomu pakietu obejmuje podpakiety.
 */
export function buildLoggerTree(loggers: LoggerInfo[]): LoggerTreeNode[] {
  const roots: LoggerTreeNode[] = [];
  const byKey = new Map<string, LoggerTreeNode>();

  for (const logger of loggers) {
    const segments = logger.name.split('.');
    let siblings = roots;
    let path = '';
    segments.forEach((segment, index) => {
      path = index === 0 ? segment : `${path}.${segment}`;
      let node = byKey.get(path);
      if (!node) {
        node = createNode(path, segment);
        byKey.set(path, node);
        siblings.push(node);
      }
      if (index === segments.length - 1) {
        node.data = logger;
        node.selectable = true;
      }
      siblings = node.children;
    });
  }

  return sortRecursively(roots.map(compress));
}
