import { useState } from "react"

export type ModalJob = {
  id: string
  title: string
  company: string
  specialty?: string
}

export function useApplyModal() {
  const [modalJob, setModalJob] = useState<ModalJob | null>(null)

  function openModal(job: ModalJob) { setModalJob(job) }
  function closeModal() { setModalJob(null) }

  return { modalJob, openModal, closeModal }
}
