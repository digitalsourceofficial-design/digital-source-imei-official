import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import type { Referral } from '@/lib/types';
import { formatCurrency, formatTimestamp } from '@/lib/whatsapp';
import { deleteReferral } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface ReferralsTableProps {
  referrals: Referral[];
  onReferralUpdate: () => void;
}

export function ReferralsTable({ referrals, onReferralUpdate }: ReferralsTableProps) {
  const [deleteCode, setDeleteCode] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDeleteReferral = async (code: string) => {
    await deleteReferral(code);
    toast({
      title: 'Referral Dihapus',
      description: `Kode referral ${code} berhasil dihapus.`,
    });
    setDeleteCode(null);
    onReferralUpdate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manajemen Referral</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode Referral</TableHead>
                <TableHead>Total User</TableHead>
                <TableHead>Total Komisi</TableHead>
                <TableHead className="hidden sm:table-cell">Riwayat Terakhir</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Belum ada data referral
                  </TableCell>
                </TableRow>
              ) : (
                referrals.map((referral) => {
                  const lastHistory =
                    referral.history.length > 0
                      ? referral.history[referral.history.length - 1]
                      : null;

                  return (
                    <TableRow key={referral.referral_code}>
                      <TableCell className="font-mono font-medium">
                        {referral.referral_code}
                      </TableCell>
                      <TableCell>{referral.total_user}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(referral.total_komisi)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {lastHistory ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {formatTimestamp(lastHistory.tanggal).split('•')[0].trim()}
                            </span>
                            <Badge
                              variant="secondary"
                              className={
                                lastHistory.status === 'paid'
                                  ? 'bg-success/10 text-success'
                                  : 'bg-warning/10 text-warning'
                              }
                            >
                              {lastHistory.status === 'paid' ? 'Paid' : 'Pending'}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteCode(referral.referral_code)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteCode} onOpenChange={() => setDeleteCode(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Referral?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus kode referral <span className="font-mono font-medium">{deleteCode}</span>? 
                Tindakan ini tidak dapat dibatalkan dan akan menghapus semua riwayat komisi.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deleteCode && handleDeleteReferral(deleteCode)}
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
