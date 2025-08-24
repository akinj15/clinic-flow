"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Stethoscope,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import FormularioAbordagem from "./_components/FormularioAbordagem";
import DetalhesMedicoCard from "./_components/DetalhesMedicoCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Prisma } from "@generated/prisma";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const searchSchema = z.object({
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { message: "CPF inválido" })
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
});

type SearchFormValues = z.infer<typeof searchSchema>;

export default function BuscarMedico() {
  const [medico, setMedico] = useState<Prisma.MedicoCreateInput>({} as Prisma.MedicoCreateInput);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cpf, setCpf] = useState("");
  const [iniciandoFeedback, setIniciandoFeedback] = useState(false);
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const [showAtencaoModal, setShowAtencaoModal] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState<Prisma.UserCreateInput>();
  
  const { data: session, isPending: loadingUser } = authClient.useSession();


  // const navigate = useNavigate();

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      cpf: "",
    },
  });

  async function fetchMedicos(cpf: string) {
    setLoading(true);
    setCpf(cpf);
    setError("");
    setMedico({} as Prisma.MedicoCreateInput);
    setIniciandoFeedback(false);

    try {
      const res = await fetch(`/api/medico/${cpf.replace(/\D/g, "")}`);
      const data = await res.json();
      if (!data || data.error) {
        setError("Médico não encontrado");
        setShowCadastroModal(true);
        return;
      }
      setMedico(data);
    } catch (error) {
      console.error("Erro ao buscar médicos:", error);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(formData: SearchFormValues) {
    await fetchMedicos(formData.cpf);
  }

  useEffect(() => {
    if (!loadingUser) setUser(session?.user || undefined);
  }, [loadingUser, session?.user]);

  const handleMedicoAtualizado = (
    medicoAtualizado: Prisma.MedicoCreateInput
  ) => {
    setMedico(medicoAtualizado);
  };

  const handleFinalizarFormulario = () => {
    setMedico({} as Prisma.MedicoCreateInput);
    setCpf("");
    setError("");
    setIniciandoFeedback(false);
  };

  const proceedToCadastro = () => {
    setShowCadastroModal(false);
    setShowAtencaoModal(true);
  };

  const navigateToCadastro = () => {
    router.push("/dashboard/cadastrar-medico?cpf=" + cpf);
  };

  if (iniciandoFeedback && medico) {
    return (
      <FormularioAbordagem
        medico={medico}
        onFinalizar={handleFinalizarFormulario}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Buscar Médico
          </h1>
          <p className="text-gray-600">
            Digite o CPF para iniciar um feedback com o profissional
          </p>
        </div>

        <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Search className="w-5 h-5" />
              Busca por CPF
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="flex gap-4">
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Digite o CPF do médico..."
                              className="text-lg py-3 border-blue-200 focus:border-blue-400"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Buscar
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {error && (
          <Alert
            variant="destructive"
            className="mb-6 border-red-200 bg-red-50"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {medico && medico.id &&!iniciandoFeedback && !loading && (
          <DetalhesMedicoCard
            medico={medico}
            onIniciarFeedback={() => setIniciandoFeedback(true)}
            onMedicoAtualizado={handleMedicoAtualizado}
            user={user}
          />
        )} 

        {!medico.id && !loading && !error && (
          <div className="text-center py-12">
            <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Digite um CPF para buscar
            </h3>
            <p className="text-gray-500">
              As informações do profissional aparecerão aqui
            </p>
          </div>
        )}
      </div>

      <AlertDialog open={showCadastroModal} onOpenChange={setShowCadastroModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Médico não cadastrado</AlertDialogTitle>
            <AlertDialogDescription>
              O CPF não foi encontrado em nosso sistema. Deseja cadastrar um
              novo profissional?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não</AlertDialogCancel>
            <AlertDialogAction onClick={proceedToCadastro}>
              Sim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showAtencaoModal} onOpenChange={setShowAtencaoModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Atenção
            </AlertDialogTitle>
            <AlertDialogDescription>
              Verifique se o número do CPF foi digitado corretamente para evitar
              cadastros duplicados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            {/* <AlertDialogAction> */}
            <AlertDialogAction onClick={navigateToCadastro}>
              Continuar Cadastro
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
