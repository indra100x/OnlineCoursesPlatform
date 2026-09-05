import { Check, Clock, MessageSquare, UserCheck, UserX, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { EmptyState } from '@/components/platform/empty-state';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

type TeacherRequestItem = {
    id: number;
    name: string;
    email: string;
    bio: string | null;
    proof_link: string | null;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
};

export default function AdminTeacherRequests() {
    const [requests, setRequests] = useState<TeacherRequestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionError, setActionError] = useState<string | null>(null);

    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [notesModal, setNotesModal] = useState<{ id: number; action: 'approve' | 'reject'; name: string } | null>(null);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const loadRequests = async () => {
            setLoading(true);
            setActionError(null);

            try {
                const response = await api.get<TeacherRequestItem[]>('/teacher-requests');
                setRequests(response.data);
            } catch {
                setActionError('Unable to load teacher requests.');
            } finally {
                setLoading(false);
            }
        };

        void loadRequests();
    }, []);

    const filtered = requests.filter((r) => {
        const haystack = `${r.name} ${r.email} ${r.status}`.toLowerCase();

        return haystack.includes(search.toLowerCase());
    });

    const pending = requests.filter((r) => r.status === 'pending').length;
    const approved = requests.filter((r) => r.status === 'approved').length;
    const rejected = requests.filter((r) => r.status === 'rejected').length;

    async function handleAction(id: number, action: 'approve' | 'reject') {
        if (notesModal) {
            setNotesModal(null);
        }

        setActionLoading(id);
        setActionError(null);

        try {
            await api.post(`/teacher-requests/${id}/${action}`, {
                admin_notes: notes || undefined,
            });
            setNotes('');
            const response = await api.get<TeacherRequestItem[]>('/teacher-requests');
            setRequests(response.data);
        } catch (submitError: unknown) {
            const message = submitError instanceof Error
                ? (submitError as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            setActionError(message ?? `Unable to ${action} this request.`);
        } finally {
            setActionLoading(null);
        }
    }

    function openNotesModal(id: number, action: 'approve' | 'reject', name: string) {
        setNotes('');
        setNotesModal({ id, action, name });
        setActionError(null);
    }

    function handleNotesSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (notesModal) {
            void handleAction(notesModal.id, notesModal.action);
        }
    }

    function statusIcon(status: string) {
        switch (status) {
            case 'approved': return <UserCheck className="size-4 text-green-600" />;
            case 'rejected': return <UserX className="size-4 text-red-500" />;
            default: return <Clock className="size-4 text-amber-500" />;
        }
    }

    const statusLabel = (status: string) => {
        switch (status) {
            case 'approved': return 'Approved';
            case 'rejected': return 'Rejected';
            default: return 'Pending';
        }
    };

    const statusClass = (status: string) => {
        switch (status) {
            case 'approved': return 'text-green-700 bg-green-50 border-green-200';
            case 'rejected': return 'text-red-700 bg-red-50 border-red-200';
            default: return 'text-amber-700 bg-amber-50 border-amber-200';
        }
    };

    return (
        <div className="space-y-5">
            <section className="grid gap-4 sm:grid-cols-3">
                <div className="brand-surface p-5">
                    <p className="brand-kicker">Pending</p>
                    <p className="mt-2 text-3xl font-black text-black">{pending}</p>
                    <p className="mt-1 text-sm text-black/50">Awaiting review</p>
                </div>
                <div className="brand-surface-blue p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">Approved</p>
                    <p className="mt-2 text-3xl font-black text-white">{approved}</p>
                    <p className="mt-1 text-sm text-white/65">Accounts created</p>
                </div>
                <div className="brand-surface-accent p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/55">Rejected</p>
                    <p className="mt-2 text-3xl font-black text-black">{rejected}</p>
                    <p className="mt-1 text-sm text-black/55">Declined requests</p>
                </div>
            </section>

            <section>
                <div className="brand-surface p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-black">Teacher requests</h2>
                            <p className="text-xs text-black/50">Review, approve, or reject teacher registration requests.</p>
                        </div>
                        <div className="w-full sm:w-60">
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by name, email, or status"
                            />
                        </div>
                    </div>

                    {actionError ? (
                        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{actionError}</p>
                    ) : null}

                    <div className="mt-4">
                        {loading ? (
                            <p className="text-sm text-black/45">Loading requests...</p>
                        ) : filtered.length === 0 ? (
                            <EmptyState title="No requests found" description={search ? 'Try a different search term.' : 'No teacher registration requests yet.'} />
                        ) : (
                            <div className="space-y-2">
                                {filtered.map((req) => (
                                    <div
                                        key={req.id}
                                        className="flex flex-col gap-3 rounded-[1.25rem] border border-black/8 bg-[#fffdf7] p-4 sm:flex-row sm:items-start sm:justify-between hover:border-black/15 transition-colors"
                                    >
                                        <div className="flex items-start gap-3 min-w-0 flex-1">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-[1rem] bg-black text-white">
                                                {statusIcon(req.status)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-black">{req.name}</p>
                                                <p className="text-xs text-black/50">{req.email}</p>
                                                {req.bio ? (
                                                    <p className="mt-1.5 text-xs text-black/60 line-clamp-2">{req.bio}</p>
                                                ) : null}
                                                {req.proof_link ? (
                                                    <a
                                                        href={req.proof_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-1 inline-flex items-center gap-1 text-xs text-[#2563eb] hover:underline"
                                                    >
                                                        View proof of teaching
                                                    </a>
                                                ) : null}
                                                {req.admin_notes ? (
                                                    <p className="mt-1.5 flex items-center gap-1 text-xs text-black/45">
                                                        <MessageSquare className="size-3" />
                                                        {req.admin_notes}
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-2">
                                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusClass(req.status)}`}>
                                                {statusIcon(req.status)}
                                                {statusLabel(req.status)}
                                            </span>
                                            <p className="text-[10px] text-black/40">
                                                {new Date(req.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-5 brand-surface p-5">
                    <h2 className="text-base font-semibold text-black">Pending reviews</h2>
                    <p className="mt-0.5 text-xs text-black/50">Review and act on teacher registration requests.</p>

                    <div className="mt-4 space-y-2">
                        {loading ? (
                            <p className="text-sm text-black/45">Loading...</p>
                        ) : requests.filter((r) => r.status === 'pending').length === 0 ? (
                            <EmptyState title="All caught up" description="No pending teacher requests to review." />
                        ) : (
                            requests
                                .filter((r) => r.status === 'pending')
                                .map((req) => (
                                    <div
                                        key={req.id}
                                        className="flex flex-col gap-3 rounded-[1.25rem] border border-amber-200/50 bg-[#fffdf7] p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-black">{req.name}</p>
                                            <p className="text-xs text-black/50">{req.email}</p>
                                            {req.bio ? (
                                                <p className="mt-1 text-xs text-black/60 line-clamp-2">{req.bio}</p>
                                            ) : null}
                                            {req.proof_link ? (
                                                <a
                                                    href={req.proof_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-1 inline-flex items-center gap-1 text-xs text-[#2563eb] hover:underline"
                                                >
                                                    View proof of teaching
                                                </a>
                                            ) : null}
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="rounded-[0.8rem] bg-green-700 text-white hover:bg-green-800"
                                                disabled={actionLoading === req.id}
                                                onClick={() => openNotesModal(req.id, 'approve', req.name)}
                                            >
                                                <Check className="size-3.5" />
                                                Approve
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="rounded-[0.8rem] border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                disabled={actionLoading === req.id}
                                                onClick={() => openNotesModal(req.id, 'reject', req.name)}
                                            >
                                                <X className="size-3.5" />
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            </section>

            <Dialog open={notesModal !== null} onOpenChange={(open) => {
 if (!open) {
 setNotesModal(null); 
} 
}}>
                <DialogContent className="rounded-[1.5rem]">
                    <DialogHeader>
                        <DialogTitle>
                            {notesModal?.action === 'approve' ? 'Approve' : 'Reject'} {notesModal?.name}
                        </DialogTitle>
                        <DialogDescription>
                            {notesModal?.action === 'approve'
                                ? 'A teacher account will be created for this user.'
                                : 'This request will be marked as rejected.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-3.5" onSubmit={handleNotesSubmit}>
                        <div className="space-y-1.5">
                            <Label htmlFor="admin-notes" className="text-xs font-semibold">
                                Admin notes <span className="text-black/40">(optional)</span>
                            </Label>
                            <textarea
                                id="admin-notes"
                                className="min-h-20 w-full rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm text-black placeholder:text-black/30 outline-none transition-all focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                placeholder="Add a note about this decision..."
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => {
 setNotesModal(null); setActionError(null); 
}}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className={`rounded-xl ${notesModal?.action === 'approve' ? 'bg-green-700 text-white hover:bg-green-800' : 'bg-red-600 text-white hover:bg-red-700'}`}
                                disabled={actionLoading === notesModal?.id}
                            >
                                {actionLoading === notesModal?.id
                                    ? 'Processing...'
                                    : notesModal?.action === 'approve'
                                        ? 'Confirm approval'
                                        : 'Confirm rejection'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
