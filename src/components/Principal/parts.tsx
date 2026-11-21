import { KratongNormalPartType } from "@map/kratong";

interface KratongNormalPartProps {
  part: KratongNormalPartType;
  selected: string;
}

export function PrincipalPart({ part, selected }: KratongNormalPartProps) {
  return (
    <div className="select-none" style={{ display: selected === part.id ? "inline-block" : "none" }}>
      <img className="select-none" src={part.url} alt={part.name} />
    </div>
  );
}
