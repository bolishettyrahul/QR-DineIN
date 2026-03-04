import { Button } from '@/components/Button';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    isDanger?: boolean;
    isAlert?: boolean;
}

export function ConfirmModal({
    isOpen, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, isDanger = true, isAlert = false
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true">
            <div className="bg-white rounded-[24px] p-6 w-full max-w-sm shadow-[0_20px_40px_rgba(0,0,0,0.1)] animate-fade-in-up">

                {isDanger ? (
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                ) : (
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-[#ea580c]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                )}

                <h3 className="text-[20px] font-black tracking-tight text-stone-900 mb-2">{title}</h3>
                <p className="text-[15px] font-medium text-stone-500 mb-8 leading-relaxed whitespace-pre-line">{message}</p>
                <div className="flex gap-3">
                    {!isAlert && onCancel && (
                        <Button variant="secondary" onClick={onCancel} className="flex-1 !rounded-[14px]">
                            {cancelText}
                        </Button>
                    )}
                    <Button
                        onClick={onConfirm}
                        className={`flex-1 !rounded-[14px] font-bold ${isDanger ? '!bg-red-500 hover:!bg-red-600 text-white shadow-[0_4px_15px_rgba(239,68,68,0.3)]' : '!bg-stone-900 hover:!bg-[#ea580c] text-white'}`}
                    >
                        {isAlert ? 'OK' : confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
