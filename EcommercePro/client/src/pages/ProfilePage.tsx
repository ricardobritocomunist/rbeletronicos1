import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth, addressSchema, updateUserSchema } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<string>("personal");
  const { user, address, orders, isAddressLoading, isOrdersLoading, updateUserMutation, updateAddressMutation, logoutMutation } = useAuth();
  const [_, navigate] = useLocation();

  // Formulário para edição de dados pessoais
  const userForm = useForm({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  // Formulário para edição de endereço
  const addressForm = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: address?.street || "",
      number: address?.number || "",
      complement: address?.complement || "",
      district: address?.district || "",
      city: address?.city || "",
      state: address?.state || "",
      zipCode: address?.zipCode || "",
      country: address?.country || "Brasil",
    },
  });

  // Atualizar formulários quando os dados são carregados
  if (user && !userForm.formState.isDirty) {
    userForm.reset({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    });
  }

  if (address && !addressForm.formState.isDirty) {
    addressForm.reset({
      street: address.street || "",
      number: address.number || "",
      complement: address.complement || "",
      district: address.district || "",
      city: address.city || "",
      state: address.state || "",
      zipCode: address.zipCode || "",
      country: address.country || "Brasil",
    });
  }

  // Manipuladores de envio
  const onUserSubmit = (data: any) => {
    updateUserMutation.mutate(data);
  };

  const onAddressSubmit = (data: any) => {
    updateAddressMutation.mutate(data);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Formatador de data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obtém o status traduzido do pedido
  const getOrderStatus = (status: string) => {
    const statusMap: Record<string, { text: string; class: string }> = {
      "pending": { text: "Pendente", class: "text-yellow-600" },
      "completed": { text: "Concluído", class: "text-green-600" },
      "cancelled": { text: "Cancelado", class: "text-red-600" },
      "processing": { text: "Processando", class: "text-blue-600" },
      "shipped": { text: "Enviado", class: "text-purple-600" },
      "delivered": { text: "Entregue", class: "text-green-600" },
    };

    return statusMap[status] || { text: status, class: "text-gray-600" };
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Minha Conta</h1>
          <Button variant="outline" onClick={handleLogout} disabled={logoutMutation.isPending}>
            {logoutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Sair
          </Button>
        </div>

        <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="address">Endereço</TabsTrigger>
            <TabsTrigger value="orders">Meus Pedidos</TabsTrigger>
          </TabsList>

          {/* Aba de Dados Pessoais */}
          <TabsContent value="personal">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais
                </CardDescription>
              </CardHeader>
              <Form {...userForm}>
                <form onSubmit={userForm.handleSubmit(onUserSubmit)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={userForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite seu nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={userForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite seu e-mail" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={userForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite seu telefone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      disabled={updateUserMutation.isPending || !userForm.formState.isDirty}
                    >
                      {updateUserMutation.isPending ? "Salvando..." : "Salvar alterações"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>

          {/* Aba de Endereço */}
          <TabsContent value="address">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Endereço de Entrega</CardTitle>
                <CardDescription>
                  Atualize seu endereço de entrega
                </CardDescription>
              </CardHeader>
              {isAddressLoading ? (
                <CardContent className="flex justify-center p-6">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
              ) : (
                <Form {...addressForm}>
                  <form onSubmit={addressForm.handleSubmit(onAddressSubmit)}>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <FormField
                            control={addressForm.control}
                            name="street"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Logradouro</FormLabel>
                                <FormControl>
                                  <Input placeholder="Rua, Avenida, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={addressForm.control}
                          name="number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número</FormLabel>
                              <FormControl>
                                <Input placeholder="Número" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={addressForm.control}
                          name="complement"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Complemento</FormLabel>
                              <FormControl>
                                <Input placeholder="Apartamento, Bloco, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addressForm.control}
                          name="district"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bairro</FormLabel>
                              <FormControl>
                                <Input placeholder="Digite o bairro" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={addressForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cidade</FormLabel>
                              <FormControl>
                                <Input placeholder="Digite a cidade" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addressForm.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estado</FormLabel>
                              <FormControl>
                                <Input placeholder="Digite o estado" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={addressForm.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CEP</FormLabel>
                              <FormControl>
                                <Input placeholder="00000-000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addressForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>País</FormLabel>
                              <FormControl>
                                <Input placeholder="Digite o país" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        type="submit"
                        disabled={updateAddressMutation.isPending || !addressForm.formState.isDirty}
                      >
                        {updateAddressMutation.isPending ? "Salvando..." : "Salvar endereço"}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              )}
            </Card>
          </TabsContent>

          {/* Aba de Pedidos */}
          <TabsContent value="orders">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Meus Pedidos</CardTitle>
                <CardDescription>
                  Veja o histórico de seus pedidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isOrdersLoading ? (
                  <div className="flex justify-center p-6">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Você ainda não realizou nenhum pedido.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate("/")}
                    >
                      Ir às compras
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-md p-4">
                        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">Pedido #{order.id}</h3>
                              <span className={`text-sm ${getOrderStatus(order.status).class}`}>
                                {getOrderStatus(order.status).text}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Realizado em {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="font-medium">
                            Total: R$ {parseFloat(order.amount).toFixed(2).replace(".", ",")}
                          </div>
                        </div>

                        <Separator className="my-3" />

                        <div className="space-y-2 mt-4">
                          <h4 className="text-sm font-medium">Itens do pedido:</h4>
                          <div className="grid gap-3">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between items-center text-sm">
                                <div>
                                  <span className="font-medium">Produto #{item.productId}</span>
                                  <span className="mx-2">•</span>
                                  <span>Quantidade: {item.quantity}</span>
                                </div>
                                <div>
                                  R$ {parseFloat(item.price).toFixed(2).replace(".", ",")}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}