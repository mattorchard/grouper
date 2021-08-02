import { FC } from "preact/compat";
import { useCallback, useState } from "preact/hooks";
import useWindowEvent from "../hooks/useWindowEvent";
import { Rule } from "../types";
import { filterSplit } from "../helpers/utilities";

interface DragState {
  ruleId: string;
  ruleIndex: number;
  offsetX: number;
  offsetY: number;
  height: number;
  width: number;
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

const RuleOrderer: FC<{
  rules: Rule[];
  onOrderChange: (rules: Rule[]) => void;
}> = ({ rules, onOrderChange }) => {
  const [dragState, setDragState] = useState<DragState | null>(null);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const offset = event.key === "ArrowLeft" ? -1 : +1;

    const ruleElement = getRuleElement(event.target);
    if (!ruleElement) return;

    const ruleId = ruleElement.dataset.ruleId!;
    const oldIndex = Number(ruleElement.dataset.ruleIndex!);
    const ruleIndex = oldIndex + offset;
    if (ruleIndex < 0 || ruleIndex >= rules.length) return;
    onOrderChange(createNewOrder(rules, ruleId, ruleIndex));
    setTimeout(() => ruleElement.focus());
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
  return (
    <ol
      className={`rule-orderer rule-orderer--${dragState && "dragging"}`}
      onPointerDown={onPointerDown}
      onPointerOver={onPointerOver}
      onKeyDown={onKeyDown}
      style={{
        "--offset-x": dragState?.offsetX,
        "--offset-y": dragState?.offsetY,
        "--drag-width": dragState?.width,
        "--drag-height": dragState?.height,
      }}
    >
      {rules.map((rule, index) => (
        <li
          key={rule.id}
          data-rule-id={rule.id}
          data-rule-index={index}
          className={`rule-orderer__item ${
            rule.id === dragState?.ruleId && "rule-orderer__item--dragging"
          }`}
          tabIndex={0}
        >
          <div className={`rule-orderer__item__inner color-${rule.color}`}>
            {rule.title.trim() || "(blank)"}
          </div>
        </li>
      ))}
    </ol>
  );
};

export default RuleOrderer;
