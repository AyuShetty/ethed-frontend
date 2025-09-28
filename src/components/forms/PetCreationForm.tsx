"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Heart, Zap } from "lucide-react";
import { toast } from "sonner";

interface PetCreationFormProps {
  onSuccess?: (pet: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

const PET_TYPES = [
  { 
    id: "buddy", 
    name: "Learning Buddy", 
    icon: Heart, 
    description: "A friendly companion to help you learn",
    color: "text-pink-500"
  },
  { 
    id: "sage", 
    name: "Code Sage", 
    icon: Sparkles, 
    description: "A wise mentor for your coding journey",
    color: "text-purple-500" 
  },
  { 
    id: "spark", 
    name: "Energy Spark", 
    icon: Zap, 
    description: "An energetic motivator for challenges",
    color: "text-yellow-500" 
  },
];

export default function PetCreationForm({ onSuccess, onError, className }: PetCreationFormProps) {
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState("buddy");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter a name for your pet");
      return;
    }

    if (name.length < 2) {
      toast.error("Pet name must be at least 2 characters");
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch("/api/user/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          petType: selectedType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create pet");
      }

      toast.success(`${data.pet.name} has been created!`);
      onSuccess?.(data.pet);
      
      // Reset form
      setName("");
      setSelectedType("buddy");

    } catch (error: any) {
      const errorMessage = error.message || "Failed to create pet";
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          Create Your Learning Pet
        </CardTitle>
        <CardDescription>
          Choose a companion to accompany you on your EthEd journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pet Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose Pet Type</Label>
            <div className="grid grid-cols-1 gap-3">
              {PET_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedType === type.id
                        ? "border-emerald-500 bg-emerald-50/50 shadow-md"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-1 ${type.color}`} />
                      <div>
                        <h3 className="font-medium text-sm">{type.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pet Name Input */}
          <div className="space-y-2">
            <Label htmlFor="petName" className="text-sm font-medium">
              Pet Name
            </Label>
            <Input
              id="petName"
              type="text"
              placeholder="Enter your pet's name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="w-full"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              {name.length}/20 characters
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
            disabled={loading || !name.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Pet...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Create Pet
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}