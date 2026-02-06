import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Shield,
  Zap,
  MessageCircle,
  BadgeCheck,
  ArrowRight,
  ClipboardList,
  CreditCard,
  Settings,
  CheckCircle2,
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Tanpa Login',
    description: 'Proses cepat tanpa perlu membuat akun atau login.',
  },
  {
    icon: Zap,
    title: 'Harga Transparan',
    description: 'Harga jelas di awal, tidak ada biaya tersembunyi.',
  },
  {
    icon: MessageCircle,
    title: 'Update via WhatsApp',
    description: 'Notifikasi status langsung ke WhatsApp Anda.',
  },
  {
    icon: BadgeCheck,
    title: 'Garansi Jelas',
    description: 'Garansi pengerjaan sesuai paket layanan.',
  },
];

const steps = [
  {
    step: 1,
    icon: ClipboardList,
    title: 'Pilih Layanan',
    description: 'Pilih paket unblock sesuai kebutuhan Anda.',
  },
  {
    step: 2,
    icon: Settings,
    title: 'Input Data IMEI',
    description: 'Masukkan IMEI dan informasi device.',
  },
  {
    step: 3,
    icon: CreditCard,
    title: 'Pembayaran',
    description: 'Lakukan pembayaran dengan metode pilihan.',
  },
  {
    step: 4,
    icon: CheckCircle2,
    title: 'IMEI Aktif',
    description: 'IMEI Anda berhasil di-unblock!',
  },
];

export default function Index() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Unblock IMEI{' '}
              <span className="text-accent">Cepat, Aman & Transparan</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Layanan unblock IMEI profesional dengan proses mudah, harga jelas,
              dan update status real-time via WhatsApp.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg">
                <Link to="/layanan">
                  Mulai Unblock Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg">
                <Link to="/lacak">Lacak Pesanan</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Mengapa Memilih Kami?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Layanan unblock IMEI terpercaya dengan berbagai keunggulan.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Cara Kerja Layanan
            </h2>
            <p className="mt-4 text-muted-foreground">
              Proses unblock IMEI dalam 4 langkah mudah.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="lg">
              <Link to="/layanan">
                Mulai Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-10 text-center">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Siap Unblock IMEI Anda?
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Proses cepat, aman, dan transparan. Mulai sekarang.
              </p>
              <div className="mt-6">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/layanan">
                    Mulai Unblock
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
