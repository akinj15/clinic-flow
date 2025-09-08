"use client"

 import { useState, useEffect, useCallback, useRef } from "react";
import { Check, ChevronsUpDown, Search, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Prisma } from "@generated/prisma";

interface SearchableSelectProps {
  placeholder?: string;
  onSelect?: (user: Prisma.MedicoCreateInput | null) => void;
}

export function SearchableSelect({
  placeholder = "Buscar...",
  onSelect,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [medicos, setMedicos] = useState<Prisma.MedicoCreateInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMedico, setSelectedMedido] =
    useState<Prisma.MedicoCreateInput | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Função para buscar usuários no banco de dados
  const searchMedicos = useCallback(async (query: string) => {
    if (!query.trim()) {
      setMedicos([]);
      return;
    }

    setLoading(true);
    try {
      // Aqui você faria a chamada real para sua API/banco de dados
      const response = await fetch(
        `/api/medico?q=${encodeURIComponent(query)}`
      );

      if (response.ok) {
        const data = await response.json();
        setMedicos(data || []);
      } else {
        console.error("Erro ao buscar usuários");
        setMedicos([]);
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      setMedicos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce da busca para evitar muitas requisições
  useEffect(() => {
    const timer = setTimeout(() => {
      searchMedicos(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchMedicos]);

  const handleSelect = (medico: Prisma.MedicoCreateInput) => {
    setSelectedMedido(medico);
    setValue(medico.id  || "");
    setOpen(false);
    onSelect?.(medico);
  };

  const handleClear = () => {
    setSelectedMedido(null);
    setValue("");
    setSearchQuery("");
    setMedicos([]);
    onSelect?.(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          ref={triggerRef}
          className="w-full justify-between bg-transparent"
        >
          {selectedMedico ? (
            <div className="flex items-center gap-2">
              <span className="truncate">{selectedMedico.nomeCompleto}</span>
              <span className="text-xs text-muted-foreground truncate">
                {selectedMedico.cpf}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {selectedMedico.crm}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0"
        align="start"
        style={{ width: triggerRef.current?.offsetWidth }}
      >
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Stethoscope className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Digite para buscar..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList>
            {loading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Buscando...
              </div>
            )}

            {!loading && searchQuery && medicos.length === 0 && (
              <CommandEmpty>Nenhum médico encontrado.</CommandEmpty>
            )}

            {!loading && !searchQuery && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Digite para buscar médicos.
              </div>
            )}

            {medicos.length > 0 && (
              <CommandGroup>
                {medicos.map((medico) => (
                  <CommandItem
                    key={medico.id}
                    value={medico.id}
                    onSelect={() => handleSelect(medico)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{medico.nomeCompleto}</span>
                      <span className="text-xs text-muted-foreground">
                        {medico.crm}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {medico.cpf}
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        value === medico.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>

          {selectedMedico && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="w-full text-xs"
              >
                Limpar seleção
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
