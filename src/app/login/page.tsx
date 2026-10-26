'use client'

import { Suspense, useEffect, useState, useSyncExternalStore, FormEvent, ChangeEvent } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FlowLogo, FlowTag } from '@/components/brand/FlowBrand'
import {
  getLegalNoticeAcceptedServerSnapshot,
  getLegalNoticeAcceptedSnapshot,
  subscribeLegalNotice,
} from '@/components/brand/LegalNoticeModal'

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const fromFlow = searchParams.get('from') === 'flow'
  const [signedIn, setSignedIn] = useState(false)
  const legalAccepted = useSyncExternalStore(
    subscribeLegalNotice,
    getLegalNoticeAcceptedSnapshot,
    getLegalNoticeAcceptedServerSnapshot
  )
  const showLegalNotice = (signedIn || status === 'authenticated') && !legalAccepted

  useEffect(() => {
    const prefilled = searchParams.get('email')
    if (prefilled && prefilled.includes('@')) {
      setEmail(prefilled.trim().toLowerCase())
    }
  }, [])

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return
    if (legalAccepted) {
      router.replace('/dashboard')
    }
  }, [status, session, legalAccepted, router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou mot de passe invalide')
        return
      }

      setSignedIn(true)
      if (!legalAccepted) {
        router.replace('/legal-notice')
      } else {
        router.replace('/dashboard')
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-[#f6f7fb]">
      <section className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#0b1330] px-8 py-10 text-white sm:px-12 lg:px-14 lg:py-14">
        <div className="flow-aurora flow-aurora-violet -top-52 -right-24 h-[560px] w-[560px]" />
        <div className="flow-aurora flow-aurora-cyan -bottom-56 -left-28 h-[480px] w-[480px]" />

        <div className="relative z-10 flex h-full flex-col">
          <div className="flex flex-col items-start gap-2.5">
            <FlowLogo variant="light" height={34} />
            <FlowTag variant="light" />
          </div>

          <div className="my-auto py-12 max-w-xl">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#d7e0f4]">
              <span className="h-[7px] w-[7px] rounded-full bg-[#26d4ea] shadow-[0_0_0_5px_rgba(38,212,234,0.14)]" />
              Espace Juridique
            </div>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              Votre équipe.{' '}
              <span className="flow-gradient-text">au même rythme.</span>
            </h1>

            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#9eb0cc]">
              Gestion des dossiers juridiques, convocations, présence et suivi des échéances — réunis dans un espace unique, pensé pour l’activité juridique.
            </p>

            <dl className="mt-9 grid grid-cols-3 gap-4 max-w-md">
              {[
                { k: 'Dossiers', v: 'Réception · Traitement · Clôture' },
                { k: 'Présence', v: 'Pointage · Suivi · Équipe' },
                { k: 'Suivi', v: 'Étapes · Échéances · Statistiques' },
              ].map((item) => (
                <div key={item.k} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5">
                  <dt className="text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-[#26d4ea]">
                    {item.k}
                  </dt>
                  <dd className="mt-1.5 text-[12.5px] leading-snug text-[#c3cee4]">{item.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="text-[12px] text-[#7f90ae]">
            © 2026 ACX Maroc — Plateforme interne. Tous droits réservés.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-[#f6f7fb] px-5 py-10">
        <div className="w-full max-w-[440px]">
          <div className="mb-6 flex flex-col items-center gap-2 lg:hidden">
            <FlowLogo height={30} />
            <FlowTag />
          </div>

          <Card className="flow-card">
            <CardHeader className="space-y-2 px-7 pt-7">
              <CardTitle className="text-[26px] font-extrabold tracking-tight text-[#0b1330]">
                {fromFlow ? 'Espace Juridique' : 'Bienvenue'}
              </CardTitle>
              <CardDescription className="text-[#62708a]">
                {fromFlow
                  ? 'Saisissez votre mot de passe pour continuer.'
                  : 'Connectez-vous à la plateforme ACX Flow.'}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5 px-7 pt-5">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {fromFlow && (
                  <div className="flex items-center gap-2.5 rounded-2xl border border-[#dfccff] bg-[#f7f2ff] px-4 py-3 text-[13px] text-[#451282]">
                    <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-[#873cf4] shadow-[0_0_0_4px_rgba(135,60,244,0.14)]" />
                    E-mail validé par le portail Flow — il ne reste que votre mot de passe.
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#18213b]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nom@vmanager.com"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="flow-field px-4"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#18213b]">
                    Mot de passe
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="flow-field px-4"
                  />
                </div>
              </CardContent>

              <CardFooter className="flex-col space-y-4 px-7 pb-7 pt-6">
                <Button
                  type="submit"
                  className="flow-button w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Connexion...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>

                <div className="text-center text-[13px] text-[#62708a]">
                  Pas de compte ?{' '}
                  <a
                    href="mailto:support@acx.ma?subject=Demande%20de%20compte%20ACX%20Flow"
                    className="font-semibold text-[#873cf4] underline-offset-4 hover:underline"
                  >
                    Contactez l&apos;administrateur
                  </a>
                </div>

                <div className="w-full border-t border-[#e4e8f1] pt-4">
                  <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-wider text-[#62708a]">
                    Accès démo
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <Link href="/admin" className="flow-button flex items-center justify-center text-[12px] !min-h-[40px]">
                      Admin
                    </Link>
                    <Link href="/juriste" className="flow-button flex items-center justify-center text-[12px] !min-h-[40px]">
                      Juriste
                    </Link>
                    <Link href="/assistant" className="flow-button flex items-center justify-center text-[12px] !min-h-[40px]">
                      Assistant
                    </Link>
                  </div>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </section>
    </div>
  )
}
