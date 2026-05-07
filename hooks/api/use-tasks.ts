import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTaskPayload, Task } from "@/lib/types/models";
import { taskService } from "../../../lib/api/services";

export const useCreateTask = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: any): Promise<Task> => taskService.create(data.statusId, data.title, data, token),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});
};
