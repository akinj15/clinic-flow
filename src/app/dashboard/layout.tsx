import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Stethoscope,
  Users,
  UserPlus,
  Search,
  Upload,
  SlidersHorizontal,
  FileBarChart,
  Building,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { auth } from "@/lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";

const allNavigationItems = [
  {
    title: "Buscar Médico",
    url: "/dashboard",
    icon: Search,
    roles: ["admin", "user"], // Disponível para todos
  },
  {
    title: "Todos os Médicos",
    url: "/dashboard/todos-medicos",
    icon: Users,
    roles: ["admin", "user"], // Disponível para todos
  },
  {
    title: "Cadastrar Médico",
    url: "/dashboard/cadastrar-medico",
    icon: UserPlus,
    roles: ["admin"], // Apenas administradores
  },
  {
    title: "Importar Médicos",
    url: "/dashboard/importar-medicos",
    icon: Upload,
    roles: ["admin"], // Apenas administradores
  },
  {
    title: "Gerenciar Opções",
    url: "/dashboard/gerencia-opcoes",
    icon: SlidersHorizontal,
    roles: ["admin"], // Apenas administradores
  },
  {
    title: "Gerenciar Unidades",
    url: "/dashboard/cadastrar-unidade",
    icon: Building,
    roles: ["admin"],
  },
  {
    title: "Relatório de Feedbacks",
    url: "/dashboard/relatorio-feedback",
    icon: FileBarChart,
    roles: ["admin"], // Apenas administradores
  },
];

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }
  const user = session.user;

  const navigationItems = allNavigationItems.filter((item) => {
    if (!user) return false; // Se não tem usuário, não mostra nada
    return item.roles.includes(user.role || "user");
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-slate-50">
        <Sidebar className="border-r border-blue-100">
          <SidebarHeader className="border-b border-blue-100 p-6 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Feedback</h2>
                <p className="text-sm text-blue-600 font-medium">
                  Gestão de Feedback Médico
                </p>
              </div>
            </div>
            {user && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-blue-600 capitalize">
                  {user.role === "admin" ? "Administrador" : "Usuário"}
                </p>
              </div>
            )}
          </SidebarHeader>

          <SidebarContent className="p-4 bg-white">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-blue-700 uppercase tracking-wider px-3 py-3">
                Navegação
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-2 ${
                          // location.pathname === item.url
                          // ? "bg-blue-100 text-blue-800 font-semibold shadow-sm"
                          // : "text-gray-700"
                          "text-gray-700"
                        }`}
                      >
                        <Link
                          href={item.url}
                          className="flex items-center gap-3 px-4 py-3"
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-blue-100 px-6 py-4 md:hidden shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-blue-50 p-2 rounded-lg transition-colors duration-200" />
              <div className="flex items-center gap-2">
                <Stethoscope className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Feedback</h1>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
