"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const sessionSchema = z.object({
  name: z.string().min(1, "Session name is required"),
  courtFee: z.string().min(1, "Court fee is required"),
  players: z.string().optional(),
});

export type SessionFormData = z.infer<typeof sessionSchema>;

interface SessionFormProps {
  onSubmit: (values: SessionFormData) => Promise<void>;
  isLoading: boolean;
}

export default function SessionForm({ onSubmit, isLoading }: SessionFormProps) {
  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: { name: "", courtFee: "", players: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <label className="text-sm font-medium text-gray-700">
                Session Name
              </label>
              <FormControl>
                <Input {...field} placeholder="Friday Night Session" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="courtFee"
          render={({ field }) => (
            <FormItem>
              <label className="text-sm font-medium text-gray-700">
                Court Fee
              </label>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  placeholder="30.00"
                  step="0.01"
                  min="0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="players"
          render={({ field }) => (
            <FormItem>
              <label className="text-sm font-medium text-gray-700">
                Players (comma-separated)
              </label>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Player1, Player2, Player3"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full gap-2" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Session"}
        </Button>
      </form>
    </Form>
  );
}
