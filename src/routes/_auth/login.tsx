import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

const RouteComponent = () => {
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
          rememberMe: data.remember,
          callbackURL: "/",
        },
        {
          onError: ({ error }) => {
            if (error.status === 403) return;

            console.error(error, "Error during sign in");
            toast.error(error.message);
          },
        }
      );

      if (result.error) {
        console.error(result.error, "Error during sign in");
        toast.error(result.error.message);
      }
    } catch (error) {
      console.error(error, "Error during sign in");
      toast.error("An error occurred while signing in");
    }
  };

  return (
    <div className="bg-card rounded-lg p-8 shadow-lg">
      <div className="mb-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-4">
          <img src="/logo.png" alt="Atlas" className="h-24 w-24" />
        </div>
        <p className="text-muted-foreground">Sign in to your account</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...field}
                  />
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
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Remember me</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <a href="#" className="text-primary text-sm hover:underline">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export const Route = createFileRoute("/_auth/login")({
  beforeLoad: async ({ context }) => {
    if (context.auth.isAuthenticated) {
      return redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});
