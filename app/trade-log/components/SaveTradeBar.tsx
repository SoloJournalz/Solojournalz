type SaveTradeBarProps = {
  isEditMode: boolean;
  saving: boolean;
  hasUnsavedChanges: boolean;
  onCancel: () => void;
  onSave: () => void;
};

export default function SaveTradeBar({
  isEditMode,
  saving,
  hasUnsavedChanges,
  onCancel,
  onSave,
}: SaveTradeBarProps) {
  return (
    <div className="mt-5 flex justify-end gap-3">
      {isEditMode && (
        <button
          type="button"
          onClick={() => {
            if (hasUnsavedChanges) {
              const leave = confirm(
                "You have unsaved changes. Leave without saving?",
              );

              if (!leave) return;
            }

            onCancel();
          }}
          className="rounded-2xl bg-[#efeee9] px-8 py-3 font-semibold text-[var(--text-secondary)]"
        >
          Cancel
        </button>
      )}

      <button
        onClick={onSave}
        disabled={saving}
        className="rounded-2xl bg-[var(--accent)] px-8 py-3 font-semibold text-white shadow-[0_10px_25px_rgba(110,17,17,0.18)] disabled:opacity-60"
      >
        {saving
          ? isEditMode
            ? "Saving Changes..."
            : "Saving..."
          : isEditMode
            ? "Save Changes"
            : "Save Trade"}
      </button>
    </div>
  );
}