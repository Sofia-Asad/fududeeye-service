import { useMutation } from '@tanstack/react-query'

import { createInquiryRequest, type CreateInquiryPayload } from '@/api/inquiries'

export function useCreateInquiry() {
  return useMutation({
    mutationFn: (payload: CreateInquiryPayload) => createInquiryRequest(payload),
  })
}
