import { FC, useRef } from "preact/compat";
import { useCallback, useState } from "preact/hooks";
import useWindowEvent from "../hooks/useWindowEvent";
import { Rule } from "../types";
import { filterSplit } from "../helpers/utilities";
import useStableId from "../hooks/useStableId";
import { isAncestor } from "../helpers/domHelpers";

interface DragState {
  ruleId: string;
  ruleIndex: number;
  offsetX: number;
  offsetY: number;
  height: number;
  width: number;
}

interface KeyboardDragState {
  ruleId: string;
}

const createNewOrder = (
  rules: Rule[],
  ruleId: string,
  newIndex: number
): Rule[] => {
  const {
    true: [rule],
    false: newOrder,
  } = filterSplit(rules, (rule) => rule.id === ruleId);
  newOrder.splice(newIndex, 0, rule);
  return newOrder;
};

const getRuleElement = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return null;
  const element = target.closest("[data-rule-id]");
  return element as HTMLElement | null;
};

const wraparound = (index: number, length: number) => {
  if (index === -1) return length - 1;
  if (index === length) return 0;
  return index;
};

const RuleOrderer: FC<{
  rules: Rule[];
  onOrderChange: (rules: Rule[]) => void;
}> = ({ rules, onOrderChange }) => {
  const listRef = useRef<HTMLOListElement>(undefined!);
  const screenReaderDescriptionId = useStableId();
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [keyboardDragState, setKeyboardDragState] =
    useState<KeyboardDragState | null>(null);

  const getKeyboardDragDescription = () => {
    if (!keyboardDragState) return "";
    const index = rules.findIndex((r) => r.id === keyboardDragState.ruleId);
    const rule = rules[index];
    return `${rule.title}, ${index + 1} of ${
      rules.length
    }, left and right arrow keys to reorder. Space or Escape to drop.`;
  };

  const focusItem = (container: HTMLElement, index: number) => {
    (
      container.querySelector(`[data-rule-index="${index}"]`) as HTMLElement
    )?.focus();
  };

  const applyKeyboardMove = (
    container: HTMLElement,
    ruleId: string,
    newIndex: number
  ) => {
    onOrderChange(createNewOrder(rules, ruleId, newIndex));
    // Focus is lost during transitions to later in the source order
    // https://github.com/preactjs/preact/issues/3242
    // This is a temporary workaround
    setTimeout(() => focusItem(container, newIndex));
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!["ArrowLeft", "ArrowRight", " ", "Escape"].includes(event.key)) return;
    const ruleElement = getRuleElement(event.target);
    if (!ruleElement) return;

    const ruleId = ruleElement.dataset.ruleId!;
    const oldIndex = Number(ruleElement.dataset.ruleIndex!);
    const container = ruleElement.closest(".rule-orderer")! as HTMLElement;

    switch (event.key) {
      case "ArrowLeft": {
        const newIndex = wraparound(oldIndex - 1, rules.length);
        if (keyboardDragState) applyKeyboardMove(container, ruleId, newIndex);
        else focusItem(container, newIndex);
        break;
      }
      case "ArrowRight": {
        const newIndex = wraparound(oldIndex + 1, rules.length);
        if (keyboardDragState) applyKeyboardMove(container, ruleId, newIndex);
        else focusItem(container, newIndex);
        break;
      }
      case " ": {
        event.preventDefault();
        if (keyboardDragState) setKeyboardDragState(null);
        else {
          setDragState(null);
          setKeyboardDragState({ ruleId });
        }
        break;
      }
      case "Escape": {
        setKeyboardDragState(null);
        break;
      }
    }
    return;
  };

  const onPointerOver = (event: PointerEvent) => {
    if (!dragState) return;
    if (!event.isPrimary) return;

    const ruleElement = getRuleElement(event.target);
    const ruleIndex = Number(ruleElement?.dataset.ruleIndex);
    if (isNaN(ruleIndex) || ruleIndex === dragState.ruleIndex) return;

    onOrderChange(createNewOrder(rules, dragState.ruleId, ruleIndex));
    setDragState((dragState) => dragState && { ...dragState, ruleIndex });
  };

  const onPointerDown = useCallback((event: PointerEvent) => {
    if (!event.isPrimary) return;
    setKeyboardDragState(null);
    setDragState((currentDragState) => {
      if (currentDragState) return currentDragState;

      const ruleElement = getRuleElement(event.target);
      if (!ruleElement) return null;

      const rect = ruleElement.getBoundingClientRect();
      return {
        ruleId: ruleElement.dataset.ruleId!,
        ruleIndex: Number(ruleElement.dataset.ruleIndex!),
        offsetX: event.offsetX,
        offsetY: event.offsetY,
        width: rect.width,
        height: rect.height,
      };
    });
  }, []);

  useWindowEvent(
    "pointerup",
    useCallback((event: PointerEvent) => {
      if (!event.isPrimary) return;
      setDragState(null);
    }, [])
  );

  useWindowEvent(
    "focusin",
    useCallback(
      (event) => {
        if (!isAncestor(listRef.current!, event.target as HTMLElement))
          setKeyboardDragState(null);
      },
      [listRef, setKeyboardDragState]
    )
  );

  return (
    <div>
      <span id={screenReaderDescriptionId} className="sr-only">
        Press spacebar to reorder
      </span>
      <span aria-live="assertive" className="sr-only">
        {getKeyboardDragDescription()}
      </span>
      <ol
        aria-role="listbox"
        className={`rule-orderer rule-orderer--${dragState && "dragging"}`}
        onPointerDown={onPointerDown}
        onPointerOver={onPointerOver}
        onKeyDown={onKeyDown}
        ref={listRef}
        style={{
          "--offset-x": dragState?.offsetX,
          "--offset-y": dragState?.offsetY,
          "--drag-width": dragState?.width,
          "--drag-height": dragState?.height,
        }}
        aria-describedby={screenReaderDescriptionId}
      >
        {rules.map((rule, index) => (
          <li
            key={rule.id}
            data-rule-id={rule.id}
            data-rule-index={index}
            className={`rule-orderer__item ${
              rule.id === dragState?.ruleId && "rule-orderer__item--dragging"
            } ${
              rule.id === keyboardDragState?.ruleId &&
              "rule-orderer__item--keyboard-dragging"
            }`}
            aria-selected={
              rule.id === keyboardDragState?.ruleId ||
              rule.id === dragState?.ruleId
            }
            tabIndex={index ? -1 : 0}
            role="option"
            draggable={true}
          >
            <div
              className={`rule-orderer__item__inner color-${rule.color}`}
              key={`${rule.id}--inner`}
            >
              {rule.title.trim() || "(blank)"}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default RuleOrderer;
