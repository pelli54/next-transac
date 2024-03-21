"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { loginSchema } from "@/schema/schemas";

const LoginPage = () => {
  const [errorMessage, setErrorMessage] = useState<string | null | undefined>(
    ""
  );
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });
  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setErrorMessage("");
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (!result?.ok) {
      setErrorMessage(result?.error);
    }
    if (result?.ok) {
      router.push("/");
    }
  };

  return (
    <div className="h-screen flex justify-center items-center p-3">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <h1 className="text-center text-4xl font-semibold mb-6">LOGO</h1>
          <h2 className="text-center text-xl">Login</h2>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              errorMessage == "" ? "hidden" : "block",
              "py-4 px-3 bg-red-500 rounded-lg text-center"
            )}
          >
            <span>{errorMessage}</span>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="********"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-full">Login</Button>
              <div className="text-center">
                <span>
                  Don't have an account? <a href="/signup">Sign Up</a>{" "}
                </span>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
