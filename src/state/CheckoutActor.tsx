/* oxlint-disable react/only-export-components -- Provider and its guarded consumer hook share the actor context. */
import { createContext, useContext, type ReactNode } from 'react'
import { useActorRef } from '@xstate/react'
import type { ActorRefFrom } from 'xstate'
import { checkoutMachine } from './checkoutMachine'

type CheckoutActorRef = ActorRefFrom<typeof checkoutMachine>

const CheckoutActorContext = createContext<CheckoutActorRef | null>(null)

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const actorRef = useActorRef(checkoutMachine)

  return (
    <CheckoutActorContext.Provider value={actorRef}>
      {children}
    </CheckoutActorContext.Provider>
  )
}

export function useCheckoutActor(): CheckoutActorRef {
  const actorRef = useContext(CheckoutActorContext)
  if (actorRef === null) {
    throw new Error('useCheckoutActor must be used within a CheckoutProvider.')
  }
  return actorRef
}
