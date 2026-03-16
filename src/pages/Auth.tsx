import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, LogIn, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = isSignUp
      ? await signUp(email, password, displayName)
      : await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else if (isSignUp) {
      toast({ title: "Registrierung erfolgreich", description: "Bitte bestätige deine E-Mail." });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <BookOpen className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="font-display text-2xl">BookShelf</CardTitle>
          <CardDescription>
            {isSignUp ? "Erstelle ein neues Konto" : "Melde dich an, um deine Bücher zu verwalten"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Dein Name" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@beispiel.de" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {isSignUp ? <><UserPlus className="mr-2 h-4 w-4" /> Registrieren</> : <><LogIn className="mr-2 h-4 w-4" /> Anmelden</>}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isSignUp ? "Bereits ein Konto?" : "Noch kein Konto?"}{" "}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary underline-offset-4 hover:underline">
              {isSignUp ? "Anmelden" : "Registrieren"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
