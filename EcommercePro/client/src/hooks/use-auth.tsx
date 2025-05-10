import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { z } from "zod";
import { insertUserSchema, User as SelectUser, Address } from "@shared/schema";
import { apiRequest, getQueryFn, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export const loginSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória")
});

export const registerSchema = insertUserSchema
  .extend({
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
    address: z.object({
      street: z.string().optional(),
      number: z.string().optional(),
      complement: z.string().optional(),
      district: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    }).optional()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const addressSchema = z.object({
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  district: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  zipCode: z.string().min(1, "CEP é obrigatório"),
  country: z.string().min(1, "País é obrigatório"),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().optional(),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;
type AddressData = z.infer<typeof addressSchema>;
type UpdateUserData = z.infer<typeof updateUserSchema>;

export type Order = {
  id: number;
  userId: number | null;
  amount: string;
  status: string;
  paymentIntentId: string | null;
  createdAt: string;
  items: Array<{
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    price: string;
  }>;
};

type AuthContextType = {
  user: SelectUser | null;
  address: Address | null;
  orders: Order[];
  isLoading: boolean;
  isAddressLoading: boolean;
  isOrdersLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, RegisterData>;
  updateAddressMutation: UseMutationResult<Address, Error, AddressData>;
  updateUserMutation: UseMutationResult<SelectUser, Error, UpdateUserData>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  // Consultar usuário atual
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Consultar endereço do usuário
  const {
    data: address,
    isLoading: isAddressLoading,
  } = useQuery<Address | null, Error>({
    queryKey: ["/api/user/address"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user, // Só consulta se houver usuário autenticado
  });

  // Consultar pedidos do usuário
  const {
    data: orders = [],
    isLoading: isOrdersLoading,
  } = useQuery<Order[], Error>({
    queryKey: ["/api/user/orders"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user, // Só consulta se houver usuário autenticado
  });

  // Mutação para login
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Credenciais inválidas");
      }
      return await res.json();
    },
    onSuccess: (userData: SelectUser) => {
      queryClient.setQueryData(["/api/user"], userData);
      queryClient.invalidateQueries({ queryKey: ["/api/user/address"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/orders"] });
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo(a), ${userData.name || userData.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutação para registro
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", userData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao registrar conta");
      }
      return await res.json();
    },
    onSuccess: (userData: SelectUser) => {
      queryClient.setQueryData(["/api/user"], userData);
      queryClient.invalidateQueries({ queryKey: ["/api/user/address"] });
      toast({
        title: "Conta criada com sucesso",
        description: `Bem-vindo(a), ${userData.name || userData.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutação para logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/logout");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao fazer logout");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      queryClient.setQueryData(["/api/user/address"], null);
      queryClient.setQueryData(["/api/user/orders"], []);
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutação para atualizar endereço
  const updateAddressMutation = useMutation({
    mutationFn: async (addressData: AddressData) => {
      const res = await apiRequest("POST", "/api/user/address", addressData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao atualizar endereço");
      }
      return await res.json();
    },
    onSuccess: (addressData: Address) => {
      queryClient.setQueryData(["/api/user/address"], addressData);
      toast({
        title: "Endereço atualizado com sucesso",
        description: "Seu endereço foi atualizado",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar endereço",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutação para atualizar dados do usuário
  const updateUserMutation = useMutation({
    mutationFn: async (userData: UpdateUserData) => {
      const res = await apiRequest("PUT", "/api/user", userData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao atualizar dados");
      }
      return await res.json();
    },
    onSuccess: (userData: SelectUser) => {
      queryClient.setQueryData(["/api/user"], userData);
      toast({
        title: "Dados atualizados com sucesso",
        description: "Suas informações foram atualizadas",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar dados",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        address: address || null,
        orders,
        isLoading,
        isAddressLoading,
        isOrdersLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        updateAddressMutation,
        updateUserMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}