import IconThumb from "./IconThumb.jsx";

export default function IconGridItem({ name, lib, onClick, isSelected, isInWorkspace }) {
  return (
    <button
      onClick={onClick}
      disabled={isInWorkspace}
      title={isInWorkspace ? `${name} (in workspace)` : name}
      className={`is-grid-item${isSelected ? " is-grid-item--selected" : ""}`}
    >
      {isSelected && (
        <div className="is-grid-item-check">
          <span className="is-grid-item-check-mark">✓</span>
        </div>
      )}
      <IconThumb lib={lib} name={name} />
      <span className={`is-grid-item-name${isSelected ? " is-grid-item-name--selected" : ""}`}>
        {name}
      </span>
    </button>
  );
}
